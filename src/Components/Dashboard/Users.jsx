import React from 'react';
import './users.css';

const Users = ({ name }) => {
  const displayName = name.length > 30 ? `${name.slice(0, 30)}...` : name;

  return (
    <div className="user-card">
      {displayName}
    </div>
  );
};

export default Users;
