import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  link: string,
  children: React.ReactNode,
}

function NavLink({ link, children }: NavLinkProps) {
  return <li><Link to={link}>{children}</Link></li>;
}

export default function Nav() {
  return (
    <nav>
      <ul>
        <NavLink link="/">Home</NavLink>
        <NavLink link="/games">Games</NavLink>
        <NavLink link="/players">Players</NavLink>
        <NavLink link="/teams">Teams</NavLink>
      </ul>
    </nav>
  );
}