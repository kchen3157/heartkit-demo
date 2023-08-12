import Header from '../../../components/Header';
import { Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { HeartKitIcon, NeuralSpotIcon } from '../../../assets/icons';
import { observer } from 'mobx-react-lite';
import { PulsedDiv } from '../../../components/utils';
import { ecgSensorInstance } from '../../../heartkit_ble'; // Adjust the path
import { IRoot } from "../../../models/root";

interface Props {
  root: IRoot
}

const handleClick = (root: IRoot) => () => {
  // console.log(event.target);
  // console.log(event.currentTarget);
  console.log("WEBLE BUTTON clicked!");
  ecgSensorInstance.connect(root)
  .then(() => ecgSensorInstance.startNotificationsECGService());
};


const DashboardHeader = ({ root }: Props) => {
  console.debug(root.state.appState);
  console.log(root.state.appState)
  return (
      <Header>
        <Toolbar>

          <PulsedDiv>
            <HeartKitIcon fontSize='large' sx={{mr: 1}} />
          </PulsedDiv>
          <Typography variant='h5' component='div' sx={{flexGrow: 1}}>
            Live HeartKit Demo
          </Typography>

          <div>
          <button onClick={handleClick(root)}>Connect to Ambiq Heartkit EVB &#x2764;</button>
          </div>
          <Box sx={{ flexGrow: 1 }} />

          <Box alignItems='center' sx={{ display: 'flex' }}>
            <NeuralSpotIcon sx={{height: '36px', width: 'auto' }} />
          </Box>

        </Toolbar>
      </Header>
  );
}

export default observer(DashboardHeader);
