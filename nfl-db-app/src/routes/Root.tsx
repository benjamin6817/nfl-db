import Nav from '../components/Nav';
import { Outlet } from 'react-router-dom';

function Root() {
  return (
    <div className="App">
      <Nav />
      <Outlet />
    </div>
  );
}

export default Root;
