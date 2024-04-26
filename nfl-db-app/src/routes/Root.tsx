// import Nav from '../components/Nav';
import { Container } from '@mui/material';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import { Outlet } from 'react-router-dom';

function Root() {
  return (
    <div className="App">
      <ResponsiveAppBar />
      <Container>
        <Outlet />
      </Container>
    </div>
  );
}

export default Root;
