import type { FC } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link'; // Import Link from Next.js
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';

interface EcommerceStatsProps {
  cost: number;
  profit: number;
  sales: number;
}

export const EcommerceStats: FC<EcommerceStatsProps> = (props) => {
  const { cost, profit, sales } = props;

  return (
    <Card>
      <CardHeader
        title="Active Alarms"
        sx={{ 
          px: `10px!important`, 
          pt: `10px!important`, 
          pb: `0px!important`,
          marginLeft: '18%'  // Moves the title 20% to the right
        }}
      />
      <CardContent sx={{ p: `10px!important`, }}>
        <Grid
          container
          spacing={1}
        >
          <div>
            <img
              src="/assets/iconly/alarms.png"
              width={48}
              style={{ marginLeft: '30px' }}
              />
          </div>
          <Grid
            xs={12}
            md={3}
          >
            <Stack
              alignItems="center"
              justifyContent={'center'}
              direction="row"
              spacing={1}
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'neutral.800' : 'error.lightest',
                borderRadius: `8px`,
                py: '3px',
                px:1
              }}
            >
              <Box
                sx={{
                  flexShrink: 0,
                  height: 20,
                  width: 20,
                  '& img': {
                    width: '100%',
                  },
                }}
              >
                <img src="/assets/iconly/alarms_high.png" style={{ height: 20, width: 20, objectFit:'contain'}} />
              </Box>
              <div>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{fontSize: 12,lineHeight:1.1}}
                >
                  High
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: `15px!important`,
                    lineHeight: 1.1,
                    marginLeft: '10px' // Shift to the right by 10 pixels
                  }}
                >
                  -
                </Typography>
              </div>
            </Stack>
          </Grid>
          <Grid
            xs={12}
            md={3}
          >
            <Stack
              alignItems="center"
              direction="row"
              justifyContent={'center'}
              spacing={1}
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'neutral.800' : 'warning.lightest',
                  borderRadius: `8px`,
                py: '3px',
                px:1
              }}
            >
              <Box
                sx={{
                  flexShrink: 0,
                  height: 20,
                  width: 20,
                  '& img': {
                    width: '100%',
                  },
                }}
              >
                <img src="/assets/iconly/alarms_mid.png" style={{ height: 20, width: 20, objectFit:'contain'}} />
              </Box>
              <div>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{fontSize: 12,lineHeight:1.1}}
                >
                  Mid
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: `15px!important`,
                    lineHeight: 1.1,
                    marginLeft: '10px' // Shift to the right by 10 pixels
                  }}
                >                  
                  -
                </Typography>
              </div>
            </Stack>
          </Grid>
          <Grid
            xs={12}
            md={3}
          >
            <Stack
              alignItems="center"
              direction="row"
              justifyContent={'center'}
              spacing={1}
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'neutral.800' : 'success.lightest',
                  borderRadius: `8px`,
                  py: '3px',
                  px:1
              }}
            >
              <Box
                sx={{
                  flexShrink: 0,
                  height: 20,
                  width: 20,
                  '& img': {
                    width: '100%',
                  },
                }}
              >
                <img src="/assets/iconly/alarms_low.png" style={{ height: 20, width: 20, objectFit:'contain'}} />
              </Box>
              <div>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{fontSize: 12,lineHeight:1.1}}
                >
                  Low
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: `15px!important`,
                    lineHeight: 1.1,
                    marginLeft: '10px' // Shift to the right by 10 pixels
                  }}
                >
                  -
                </Typography>
              </div>
            </Stack>
          </Grid>
        </Grid>
        <Link href="/dashboard">
          <Button
            disabled
            // color="inherit"
            endIcon={
              <SvgIcon>
                <ArrowRightIcon />
              </SvgIcon>
            }
            size="small"
            sx={{
              backgroundColor: 'rgb(225, 24, 35)',    // Set background color to gray when disabled
              color: 'white',             // Ensure text is visible (white) on gray background
              paddingTop: '2px',          // Reduces padding above the button
              paddingBottom: '2px',       // Reduces padding below the button
              marginTop: 0,               // Removes extra margin-top
              marginBottom: 0,            // Removes extra margin-bottom
              marginLeft: '18%',
              '&.Mui-disabled': {         // Specifically targets disabled state
                backgroundColor: 'gray',
                color: 'white',
              },
              marginLeft: '18%'              
              }}          
          >
            View
          </Button>
        </Link>        
    </CardContent>
    </Card>
  );
};

EcommerceStats.propTypes = {
  cost: PropTypes.number.isRequired,
  profit: PropTypes.number.isRequired,
  sales: PropTypes.number.isRequired,
};
