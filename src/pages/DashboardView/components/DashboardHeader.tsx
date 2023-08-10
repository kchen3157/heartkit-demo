import Header from '../../../components/Header';
import { Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { HeartKitIcon, NeuralSpotIcon } from '../../../assets/icons';
import { observer } from 'mobx-react-lite';
import { PulsedDiv } from '../../../components/utils';
import { heartkit_ble } from '../../../heartkit_ble';

interface Props {
  appState: string
}

const hearkit_ble_dev = new heartkit_ble();

const handleClick = (event: React.MouseEvent<HTMLElement>) => {
  // console.log(event.target);
  // console.log(event.currentTarget);
  console.log("WEBLE BUTTON clicked!");
  hearkit_ble_dev.connect()
  .then(() => hearkit_ble_dev.startNotificationsECGService());
};


const DashboardHeader = ({ appState }: Props) => {
  console.debug(appState);
  console.log(appState)
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
          <button onClick={handleClick}>Connect to Ambiq Heartkit EVB &#x2764;</button>
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
