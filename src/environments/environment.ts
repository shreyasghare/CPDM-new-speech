// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  uiUrl: 'https://cpdmcentral-dev.cisco.com',
  docCentralLink: 'https://docs.cisco.com',
  docCentralAPI: 'https://api-in.cisco.com/docservices',
  thinOnlineUrl: 'https://stage-cpdmonline.cisco.com/#/stream/',
  matomo: { url: '//wwwin-enganalytics.cisco.com/matomo/', siteId : 9},
  autoSaveTimeInterval: 60000 * 5, // [US18434]  Auto save (post MVP) interval 5 mins
  froalaKeyId: '5D5C4F4G4aG3C2B4A2C4E3E3D4G2F2tldnE-11jguuueA-16fE-11F2twt==',
  froalaKey: 'VC7E6F6D3eC3I3B8C10C4C4F3A3C2B2xfotkfG5hcj1==',
  csdlManageSIHomeLink: 'https://wwwin-si-stage.cisco.com',
  csdlManageSIProjectLink: '/projects/summary/_id?tab=Vital+Signs'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.