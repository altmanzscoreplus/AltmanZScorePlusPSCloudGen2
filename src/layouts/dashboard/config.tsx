import type { ReactNode } from 'react';
import { useMemo,useState,useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Chip from '@mui/material/Chip';
import SvgIcon from '@mui/material/SvgIcon';
import { API, graphqlOperation,Auth } from 'aws-amplify';
import DatasetIcon from '@mui/icons-material/Dataset';
import FenceIcon from '@mui/icons-material/Fence';
import GraduationHat01Icon from 'src/icons/untitled-ui/duocolor/graduation-hat-01';
import HomeSmileIcon from 'src/icons/untitled-ui/duocolor/home-smile';
import LayoutAlt02Icon from 'src/icons/untitled-ui/duocolor/layout-alt-02';
import LineChartUp04Icon from 'src/icons/untitled-ui/duocolor/line-chart-up-04';
import Lock01Icon from 'src/icons/untitled-ui/duocolor/lock-01';
import LogOut01Icon from 'src/icons/untitled-ui/duocolor/log-out-01';
import Mail03Icon from 'src/icons/untitled-ui/duocolor/mail-03';
import Mail04Icon from 'src/icons/untitled-ui/duocolor/mail-04';
import MessageChatSquareIcon from 'src/icons/untitled-ui/duocolor/message-chat-square';
import ReceiptCheckIcon from 'src/icons/untitled-ui/duocolor/receipt-check';
import Share07Icon from 'src/icons/untitled-ui/duocolor/share-07';
import ShoppingBag03Icon from 'src/icons/untitled-ui/duocolor/shopping-bag-03';
import ShoppingCart01Icon from 'src/icons/untitled-ui/duocolor/shopping-cart-01';
import Truck01Icon from 'src/icons/untitled-ui/duocolor/truck-01';
import Upload04Icon from 'src/icons/untitled-ui/duocolor/upload-04';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import QueueIcon from '@mui/icons-material/Queue';
import Users03Icon from 'src/icons/untitled-ui/duocolor/users-03';
import SdCardIcon from '@mui/icons-material/SdCard';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import { tokens } from 'src/locales/tokens';
import { paths } from 'src/paths';
import CellTowerIcon from '@mui/icons-material/CellTower';
import FileCopy from '@mui/icons-material/FileCopy';

export interface Item {
  disabled?: boolean;
  external?: boolean;
  icon?: ReactNode;
  items?: Item[];
  label?: ReactNode;
  path?: string;
  title: string;
}

export interface Section {
  items: Item[];
  subheader?: string;
}

export const useSections = () => {
  const { t } = useTranslation();
  const [logedinusergroup, setLogedinusergroup] = useState('');
  const currentuser = Auth.currentAuthenticatedUser();

    useEffect(() => {
      const logedinuserdetail =   currentuser.then(result => {
        const customergroup = result.signInUserSession.accessToken.payload['cognito:groups'][0]
          setLogedinusergroup(customergroup)
        }).catch(error => {
            console.error('Error:', error);
        });
    }, [Auth]);


  return useMemo(() => {
    return [
      {
        items: [
          {
            title: 'Dashboard',
            path: paths.dashboard.index,
            icon: (
              <SvgIcon fontSize="small">
                <LayoutAlt02Icon />
              </SvgIcon>
            ),
          },
          {
            title: t(tokens.nav.account),
            path: paths.dashboard.account,
            icon: (
              <SvgIcon fontSize="small">
                <HomeSmileIcon />
              </SvgIcon>
            ),
          },
        ],
      },
      {
        subheader: 'Data View', // VINCENT_NOTE: this creates the menu items for DATA VIEW, and references src/paths.ts for the path to the index.tsx of the page
        items: [
          {
            title: 'Live Measurements',
            path: paths.dashboard.dataview.index,
            icon: (
              <SvgIcon fontSize="small">
                <Upload04Icon />
              </SvgIcon>
            ),
						
          },
					{
            title: 'Data Management',
            path: paths.dashboard.datamanagement.index,
            icon: (
              <SvgIcon fontSize="small">
                <CloudDownloadOutlinedIcon />
              </SvgIcon>
            ),
						
          },
        ],
      },
      {
        subheader: 'Resources Summary',
        items: [
          {
            title: 'Gateway Resources',
            path: paths.dashboard.gatewayresources.index,
            icon: (
              <SvgIcon fontSize="small">
                <FenceIcon />
              </SvgIcon>
            ),
          },
          {
            title: 'Data Device Resources',
            path: paths.dashboard.deviceresources.index,
            icon: (
              <SvgIcon fontSize="small">
                <DatasetIcon />
              </SvgIcon>
            ),
          },
        ],
      },
      
      {
        subheader:  logedinusergroup == "Client" ? null : 'Customer / Client Control', 
                
        items:logedinusergroup == "ClientMaster" ? [
          {
            title: 'Clients',
            path: paths.dashboard.clientcontrol.index,
            icon: (
              <SvgIcon fontSize="small">
                <SupervisedUserCircleIcon />
              </SvgIcon>
            ),
          },
        ] : [
          ...((logedinusergroup == "CustomerMaster" || logedinusergroup == "Customer") ?
          
          []
          :

          [{
            title: logedinusergroup == "Client" ? [] : 'Admin',
            path: logedinusergroup == "Client" ? [] : paths.dashboard.admincontrol.index,
            icon: logedinusergroup == "Client" ? [] : (
              <SvgIcon fontSize="small">
                <Users03Icon />
              </SvgIcon>
            ),
          }]
        ),

          {
            title: logedinusergroup == "Client" ? [] : 'Customers',
            path: logedinusergroup == "Client" ? [] : paths.dashboard.customercontrol.index,
            icon: logedinusergroup == "Client" ? [] : (
              <SvgIcon fontSize="small">
                <Users03Icon />
              </SvgIcon>
            ),
          },
          {
            title: logedinusergroup == "Client" ? [] : 'Clients',
            path: logedinusergroup == "Client" ? [] : paths.dashboard.clientcontrol.index,
            icon: logedinusergroup == "Client" ? [] : (
              <SvgIcon fontSize="small">
                <SupervisedUserCircleIcon />
              </SvgIcon>
            ),
          },
        ],
      },
      {
        subheader: 'Gateway Management',
        items: [
          {
            title: 'Gateway Control',
            path: paths.dashboard.gatewaycontrol.index,
            icon: (
              <SvgIcon fontSize="small">
                <QueueIcon />
              </SvgIcon>
            ),
          },
        ],
      },
      {
        subheader: 'Data Device Management',
        items: [
          {
            title: 'Data Device Control',
            path: paths.dashboard.datadevicecontrol.index,
            icon: (
              <SvgIcon fontSize="small">
                <Truck01Icon />
              </SvgIcon>
            ),
          },
        ]
      },
      {
        subheader: 'Network',
        items: [
          {
            title: 'Network Management',
            path: paths.dashboard.networktopology.index,
            icon: (
              <SvgIcon fontSize="small">
                <CellTowerIcon />
              </SvgIcon>
            ),
          },
        ],
      },
			{
        subheader: 'Maintenance',
        items: [
          true //logedinusergroup == "AdminMaster" || logedinusergroup == "Admin"
					? {
            title: 'Firmware Management',
            path: paths.dashboard.firmwaremanagement.index,
            icon: (
              <SvgIcon fontSize="small">
                <SdCardIcon />
              </SvgIcon>
            ),
          }
					: null,
					true //logedinusergroup == "AdminMaster" || logedinusergroup == "Admin"
					? {
            title: 'Firmware Upgrade',
            path: paths.dashboard.firmwareupgrade.index,
            icon: (
              <SvgIcon fontSize="small">
                <SystemUpdateAltIcon />
              </SvgIcon>
            ),
          }
					: null,
        ].filter(Boolean)
      },
    ];
  }, [t,logedinusergroup]);
};
