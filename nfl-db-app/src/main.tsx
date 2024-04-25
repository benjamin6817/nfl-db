import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import Root from './routes/Root';
import Games from './routes/Games';
import Players from './routes/Players';
import Teams from './routes/Teams';
import ErrorPage from './components/ErrorPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/games",
        element: <Games />,
      },
      {
        path: "/players",
        element: <Players />,
      },
      {
        path: "/teams",
        element: <Teams />,
      },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
);
