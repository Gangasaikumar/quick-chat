import { styled } from '@mui/material';
import Button from '@mui/material/Button';

const App = () => {
  return (
    <>
      <h1 className="text-3xl font-bold  text-blue-500">chat application.!</h1>
      <MyButton variant="contained">welcome!</MyButton>
    </>
  );
};


const MyButton = styled(Button)({
backgroundColor:"red",
})
export default App;
