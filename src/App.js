import React, { useState, useEffect } from 'react';
import './App.css';

var userIdName = { '': '' };
var userColors = { '': '' };
var usersAvail = { '': '' };
var priorities = {
  4: 'Urgent',
  3: 'High',
  2: 'Medium',
  1: 'Low',
  0: 'No priority'
}
var prioritIcon = {
  4: 'https://img.icons8.com/color/48/high-priority.png',
  3: 'https://img.icons8.com/windows/32/000000/high-connection.png',
  2: 'https://img.icons8.com/windows/32/737373/medium-connection.png',
  1: 'https://img.icons8.com/windows/32/low-connection.png',
  0: 'https://img.icons8.com/ios-filled/50/ellipsis.png'
}
var GroupingBy = 'Status';
var OrderingBy = 'Priority';
var isVisible = false;

function App() {
  const [raw, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [ticketGroups, setTicketGroups] = useState(new Map());
  const [vis, setVis] = useState(false);

  function toggleV() {
    if (isVisible) {
      isVisible = false;
      setVis(isVisible);
    }
    else {
      isVisible = true;
      setVis(isVisible);
    }
  }

  function updateGroups(data) {
    const allGroups = new Map();
    if (GroupingBy === 'Status') {
      allGroups.set('Backlog', []);
      allGroups.set('Todo', []);
      allGroups.set('In progress', []);
      allGroups.set('Done', []);
      allGroups.set('Cancelled', []);
    }
    if(GroupingBy === 'Priority'){
      allGroups.set(4, []);
      allGroups.set(3, []);
      allGroups.set(2, []);
      allGroups.set(1, []);
      allGroups.set(0, []);
    }
    data.forEach(element => {
      let ky = '';
      if (GroupingBy === 'Status') {
        ky = element.status;
      }
      else if (GroupingBy === 'Priority') {
        ky = element.priority;

      }
      else {
        ky = element.userId;
      }
      if (!allGroups.has(ky)) {
        allGroups.set(ky, [element]);
      } else {
        allGroups.get(ky).push(element);
      }
    });
    orderGroups(allGroups);
  }
  
  function orderGroups(allGroups){
    let sortedGroups = new Map();
    allGroups.forEach((value, key) => {
      let ky = 'priority';
      if(OrderingBy === 'Title'){
        ky = 'title';
      }
      let sorted = sortListByMapKey(value, ky, ky==='title');
      sortedGroups.set(key, sorted);
    });
    setTicketGroups(allGroups);
  }

  const handleGroupChange = event => {
    GroupingBy = event.target.value;
    updateGroups(raw);
    toggleV();
  };
  const handleOrderChange = event => {
    OrderingBy = event.target.value;
    updateGroups(raw);
    toggleV();
  };

  useEffect(() => {
    // Replace 'API_ENDPOINT' with your actual API URL
    const API_ENDPOINT = 'https://api.quicksell.co/v1/internal/frontend-assignment';

    // Fetch data from the API
    fetch(API_ENDPOINT)
      .then((response) => response.json())
      .then((result) => {
        AssignUsers(result.users);
        setLoading(false);
        setData(result.tickets);
        updateGroups(result.tickets);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      {loading ? (
        <p>Loading...</p>
      ) : mainPage(ticketGroups, toggleV, handleGroupChange, handleOrderChange)}
    </div>
  );
}

function sortListByMapKey(list, key, order) {
  console.log('list:', list);
  list.sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    if(order){
      if (valueA < valueB) {
        return -1; // a should come before b
      } else {
        return 1; // b should come before a
      }
    }
    else{
      if (valueA > valueB) {
        return -1; // a should come before b
      } else {
        return 1; // b should come before a
      }
    }
    
  });
  return list; // Return the sorted list
}
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    if (i % 2 === 0)
      color += letters[Math.floor(Math.random() * 10)];
    else
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
function AssignUsers(users) {
  users.forEach(element => {
    userIdName[element.id] = element.name;
    userColors[element.id] = getRandomColor();
    usersAvail[element.id] = element.available;
  });
}
function mainPage(ticketGroups, fn, handleGroupChange, handleOrderChange) {
  return (
    <div className='App'>
      {Header(fn)}
      <MainBody data={ticketGroups} />
      {isVisible ? Filters(handleGroupChange, handleOrderChange) : <div />}
    </div>
  );
}

function Header(fn) {
  return (
    <header className='App-header'>
      <div className='tag' style={{ marginLeft: '10px' }} onClick={fn}>
        <img width="24" height="24" style={{ marginLeft: '5px' }} src="https://img.icons8.com/windows/32/sorting-options.png" alt="sorting-options" />
        <b style={{ marginLeft: '5px', color: 'black' }}> Display</b>
        <img width="18" height="18" style={{ marginLeft: '5px' }} src="https://img.icons8.com/windows/32/expand-arrow--v1.png" alt="expand-arrow--v1" />
      </div>
    </header>
  );
}
function Filters(handleGroupChange, handleOrderChange) {
  return (
    <div className='filter' id='Filter'>
      <div className='horizontal' style={{ margin: '10px', width: "90%", justifyContent: "space-between" }}>
        Grouping

        <select value={GroupingBy} onChange={handleGroupChange} className='selector'>
          <option value="Priority" className='filter'>Priority</option>
          <option value="Users">Users</option>
          <option value="Status">Status</option>
        </select>
      </div>
      <div className='horizontal' style={{ margin: '10px', width: "90%", justifyContent: "space-between" }}>
        Ordering
        <select value={OrderingBy} onChange={handleOrderChange} className='selector'>
          <option value="Priority" className='filter'>Priority</option>
          <option value="Title">Title</option>
        </select>
      </div>
    </div>
  );
}
function MainBody(ticketGroups) {
  return (
    <div className='mainBody'>
      {Array.from(ticketGroups.data.entries()).map(([key, tickets]) => (
        <div key={key}>
          <VerticalList data={{ tickets, key }} />
        </div>
      ))}
    </div>
  );
}


function VerticalList(tickets) {
  const t = tickets.data.tickets;
  const title = tickets.data.key;
  return (
    <div className="vertical-list">
      <ListTitle data={{ t, title }} />
      {t.map((ticket) => (
        <div key={ticket.id}>
          {ListItem(ticket)}
        </div>
      ))}
    </div>
  );
}
function ListTitle(ticket) {
  const t = ticket.data.t;
  const title = ticket.data.title;
  if (GroupingBy === 'Status') {
    return (
      <div className='horizontal listtitle'>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: "center" }}>
          {StatusIcon({data: title}, true)}
          <p style={{ marginLeft: '10px' }}>{title}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <img width="20" height="20" style={{ marginLeft: '10px' }} src="https://img.icons8.com/android/24/plus.png" alt="plus" />
          <img width="20" height="20" style={{ marginLeft: '10px' }} src="https://img.icons8.com/windows/32/more.png" alt="more" />
        </div>
      </div>
    );
  }
  else if (GroupingBy === 'Priority') {
    return (
      <div className='horizontal listtitle'>
        <div style={{ display: 'flex', flexDirection: 'row',  alignItems: "center" }}>
          {PriorityIcon({data: title}, true)}
          <p style={{ marginLeft: '10px' }}>{priorities[title]}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <img width="20" height="20" style={{ marginLeft: '10px' }} src="https://img.icons8.com/android/24/plus.png" alt="plus" />
          <img width="20" height="20" style={{ marginLeft: '10px' }} src="https://img.icons8.com/windows/32/more.png" alt="more" />
        </div>
      </div>
    );
  }
  else {
    return (
      <div className='horizontal listtitle'>
        <div style={{ display: 'flex', flexDirection: 'row',  alignItems: "center" }}>
          <UserIconRelative data={title} />
          <p style={{ marginLeft: '10px' }}>{userIdName[title]}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <img width="20" height="20" style={{ marginLeft: '10px' }} src="https://img.icons8.com/android/24/plus.png" alt="plus" />
          <img width="20" height="20" style={{ marginLeft: '10px' }} src="https://img.icons8.com/windows/32/more.png" alt="more" />
        </div>
      </div>
    );
  }
}



function ListItem(ticket) {
  return (
    <div className="card">
      <UserIcon data={ticket['userId']} />
      <div className='horizontal id'>
        {ticket.id}
      </div>
      <div className='horizontal title'>
        <StatusIcon data={ticket['status']} />
        {ticket.title}
      </div>
      <div className='horizontal'>
        <PriorityIcon data={ticket['priority']} />
        {ticket.tag.map((element, index) => (
          <div className='tag' key={index}>
            <span className='icon'></span>
            <div>{element}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function UserIcon(username) {
  if(GroupingBy === 'Users'){
    return (<></>);
  }

  var l = userIdName[username.data].split(' ');
  var txt = l[0].charAt(0).toUpperCase();
  var available = 'unavailable';
  if (usersAvail[username.data]) available = 'available';
  if (l.length > 1) {
    txt = txt + l[1].charAt(0).toUpperCase();
  }
  return (
    <div className='name-icon' style={{ backgroundColor: userColors[username.data] }}>
      {txt}
      <span className={available}></span>
    </div>
  );
}
function UserIconRelative(username) {
  var l = userIdName[username.data].split(' ');
  var txt = l[0].charAt(0).toUpperCase();
  var available = 'unavailable';
  if (usersAvail[username.data]) available = 'available';
  if (l.length > 1) {
    txt = txt + l[1].charAt(0).toUpperCase();
  }
  return (
    <div className='name-icon' style={{ position: 'relative', alignSelf: 'center', backgroundColor: userColors[username.data] }}>
      {txt}
      <span className={available}></span>
    </div>
  );
}
function StatusIcon(status, compulsary) {
  if(GroupingBy === 'Status' && compulsary!=true){
    return (<></>);
  }

  if (status.data === "Todo") {
    return (
      <div className='status-icon todo'></div>
    );
  }
  else if (status.data === "In progress") {
    return (
      <div className='status-icon'>
        <img width="24" height="24" src="https://img.icons8.com/color/30/submit-progress--v1.png" alt="submit-progress--v1" />
      </div>
    );
  }
  else if (status.data === "Backlog") {
    return (
      <div className='status-icon'>
        <img width="24" height="24" src="https://img.icons8.com/material-rounded/24/backlog.png" alt="backlog" />
      </div>
    );
  }
  else if (status.data === "Done") {
    return (
      <div className='status-icon'>
        <img width="24" height="24" src="https://img.icons8.com/ultraviolet/24/000000/checked--v1.png" alt="checked--v1" />
      </div>
    );
  }
  else {
    return (
      <div className='status-icon'>
        <img width="24" height="24" src="https://img.icons8.com/office/30/cancel.png" alt="cancel"/>
      </div>
    );
  }
}
function PriorityIcon(priority, compulsary) {
  let name = prioritIcon[priority.data];
  if(GroupingBy === 'Priority' && compulsary!=true){
    return (<></>);
  }
  return (
    <div className='tag'>
      <img width="19" height="19" src={name} alt="checked--v1" />
    </div>
  );
}
export default App;
