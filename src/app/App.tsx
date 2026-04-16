// Main App component that sets up routing
import { RouterProvider } from 'react-router';
import { router } from './routes';

// Root component that provides routing configuration to the entire app
export default function App() {
  return <RouterProvider router={router} />;
}
