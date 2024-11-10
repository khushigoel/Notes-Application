import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function getGroupInitials(name) {
  const words = name.trim().split(" ");
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [groups, setGroups] = useState(() => {
    const savedGroups = JSON.parse(localStorage.getItem("groups"));
    return savedGroups || [];
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  const modalRef = useRef(null);

  const arrow = "images/Arrow.png";
  const blueArrow = "images/BlueArrow.png";

  useEffect(() => {
    localStorage.setItem("groups", JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
      if (window.innerWidth > 767) {
        setIsSidebarVisible(true); 
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    if (isMobile) {
      setIsSidebarVisible(false); 
    }
  };

  const handleBackButton = () => {
    setIsSidebarVisible(true);
    setSelectedGroup(null);
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedColor) {
      const newGroup = { id: Date.now(), name: groupName, color: selectedColor, notes: [] };
      setGroups([...groups, newGroup]);
      setGroupName('');
      setSelectedColor('');
      setIsModalOpen(false);
    }
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setGroupName('');
      setSelectedColor('');
      setIsModalOpen(false);
    }
  };

  const handleAddNote = () => {
    if (noteContent.trim() && selectedGroup) {
      const updatedGroup = {
        ...selectedGroup,
        notes: [...(selectedGroup.notes || []), { content: noteContent, timestamp: new Date() }],
      };
      const updatedGroups = groups.map((group) =>
        group.id === selectedGroup.id ? updatedGroup : group
      );
      setGroups(updatedGroups);
      setSelectedGroup(updatedGroup);
      setNoteContent('');
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <div className="App">
      {isSidebarVisible && (
        <div className="sidebar">
          <h2>Pocket Notes</h2>
          <div className="group-names">
            {groups.map((group) => (
              <div
                className={`group-item ${selectedGroup?.id === group.id ? 'active' : ''}`}
                key={group.id}
                onClick={() => handleGroupSelect(group)}
              >
                <div className="group-circle" style={{ backgroundColor: group.color }}>
                  {getGroupInitials(group.name)}
                </div>
                <span>{group.name}</span>
              </div>
            ))}
            <div className="add-button" onClick={() => setIsModalOpen(true)}>+</div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content" ref={modalRef}>
            <h3>Create New Group</h3>
            <div className="input-row">
              <p>Group Name</p>
              <input
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="input-row">
              <p>Choose color</p>
              <div className="color-picker">
                <div className="color-options">
                  {['#B38BFA', '#FF79F2', '#43E6FC', '#F19576', '#0047FF', '#6691FF'].map((color) => (
                    <div
                      key={color}
                      className={`color-circle ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="button-row">
              <button
                className="create-button"
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || !selectedColor}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="MainPage">
        {selectedGroup ? (
          <div className="NotesArea">
            
            <div className="notes-header">
            {isMobile && !isSidebarVisible && (
              <img src="images\back.png" className="back-button" onClick={handleBackButton}/>
            )}
              <div className="notes-header-circle" style={{ backgroundColor: selectedGroup.color }}>
                {getGroupInitials(selectedGroup.name)}
              </div>
              <h2>{selectedGroup.name}</h2>
            </div>
            <div className="notes-content">
              {(selectedGroup.notes && selectedGroup.notes.length > 0) ? (
                selectedGroup.notes.map((note, index) => (
                  <div key={index} className="note-card">
                    <pre>{note.content}</pre>
                    <span>{new Date(note.timestamp).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })} • {new Date(note.timestamp).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}</span>
                  </div>
                ))
              ) : (
                <p></p>
              )}
            </div>
            <div className="notes-input-blue">
              <textarea
                placeholder="Enter your text here........."
                className="notes-input"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
              <img
                src={noteContent.trim() ? blueArrow : arrow}
                className="send-icon"
                alt="Send Icon"
                onClick={handleAddNote}
                style={{ cursor: noteContent.trim() ? 'pointer' : 'not-allowed' }}
              />
            </div>
          </div>
        ) : (
          <div className="MainPage-Container">
            <img className="MainPage-Image" src="/images/main-page-image.png" alt="Description of image" />
            <h1>Pocket Notes</h1>
            <p className="MainPage-p">Send and receive messages without keeping your phone online.<br />
              Use Pocket Notes on up to 4 linked devices and 1 mobile phone
            </p>
            <div className="encrypted">
              <img className="encrypted-image" src="/images/Lock.png" alt="Lock image" />
              <p className="encrypted-text">end-to-end encrypted</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
