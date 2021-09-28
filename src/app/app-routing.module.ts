import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ErrorComponent } from '@cpdm-component/static/error/error.component';
import { RouteGuardService } from '@cpdm-service/guard/route-guard.service';

// --------Not working new style of imports as modules are not supported because of disabled diffrential lodinng------------------
// const homeModuleImport = import('./components/home/home.module')
// const accessibilityModuleImport = import('./components/general-compliance/accessibility-process/accessibility-process.module');
// const projectModuleImport = import('./components/project/project.module');
// const smartLicensingModuleImport = import('./components/general-compliance/smart-licensing/smart-licensing.module');
// const revenueRecognitionModuleImport = import('./components/general-compliance/revenue-recognition/revenue-recognition.module');

const compliancePath = './components/general-compliance';
const additionalRequirementsPath = './components/additional-requirements';
const technologyBestPracticesPath = './components/technology-best-practices';

const routes: Routes = [
  { path: '', loadChildren: './components/auth/auth.module#AuthModule' },
  {
    path: 'home',
    loadChildren: './components/home/home.module#HomeModule',
    canActivate: [RouteGuardService],
  },
  {
    path: 'project',
    loadChildren: './components/project/project.module#ProjectModule',
    canActivate: [RouteGuardService],
  },
  {
    path: 'accessibility-process',
    loadChildren: `${compliancePath}/accessibility-process/accessibility-process.module#AccessibilityProcessModule`,
    canActivate: [RouteGuardService],
  },
  {
    path: 'smart-licensing',
    loadChildren: `${compliancePath}/smart-licensing/smart-licensing.module#SmartLicensingModule`,
    canActivate: [RouteGuardService],
  },
  {
    path: 'revenue-recognition',
    loadChildren: `${compliancePath}/revenue-recognition/revenue-recognition.module#RevenueRecognitionModule`,
    canActivate: [RouteGuardService],
  },
  {
    path: 'csdl',
    loadChildren: `${compliancePath}/csdl/csdl.module#CSDLModule`,
    canActivate: [RouteGuardService],
  },
  {
    path: 'tpsd',
    loadChildren: `${compliancePath}/tpsd/tpsd.module#TpsdModule`,
    canActivate: [RouteGuardService]
  },
  {
    path: 'export-compliance',
    loadChildren: `${compliancePath}/export-compliance/export-compliance.module#ExportComplianceModule`,
    canActivate: [RouteGuardService],
  },
  {
    path: 'communications-regulatory',
    loadChildren: `${additionalRequirementsPath}/communications-regulatory/communications-regulatory.module#CommunicationsRegulatoryModule`,
    canActivate: [RouteGuardService],
  },
  {
    path: 'globalization',
    // loadChildren: () => import(`${additionalRequirementsPath}/globalization/globalization.module`).then(module => module.GlobalizationModule),
    loadChildren: `${additionalRequirementsPath}/globalization/globalization-wf.module#GlobalizationWfModule`,
    canActivate: [RouteGuardService],
  },
  {
    path: 'api-products',
    loadChildren: `${technologyBestPracticesPath}/api-products/api-products.module#ApiProductsModule`,
    canActivate: [RouteGuardService],
  },
  {
    path: 'telemetry',
    loadChildren: `${technologyBestPracticesPath}/telemetry/telemetry.module#TelemetryModule`,
    canActivate: [RouteGuardService],
  },
  {
    path: 'ipv6',
    loadChildren: `${technologyBestPracticesPath}/ipv6/ipv6.module#IPv6Module`,
    canActivate: [RouteGuardService],
  },
  {
    path: 'serviceability',
    loadChildren: `${technologyBestPracticesPath}/serviceability/serviceability.module#ServiceabilityModule`,
    canActivate: [RouteGuardService],
  },
  {
    path: 'admin',
    loadChildren: `./components/admin/admin.module#AdminModule`,
    canActivate: [RouteGuardService],
  },
  { path: '**', component: ErrorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
