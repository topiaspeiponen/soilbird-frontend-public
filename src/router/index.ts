import i18n from '../i18n';
import { Turf } from './../static/TurfType';
import { SportsProperty } from './../static/SportsPropertyType';

import { CredentialLevel, UserType } from './../auth/UserType';

import Vue from 'vue'
import VueRouter, { Route, RouteConfig } from 'vue-router'
import DashboardCommon from '../views/DashboardCommon.vue'
import DashboardBoss from '../views/DashboardBoss.vue'
import Field from '../views/Field.vue'
import AllFields from '../views/AllFields.vue'
import Login from '../views/Login.vue'
import PageNotFound from '../views/PageNotFound.vue';
import ComparisonTool from '../views/ComparisonTool.vue';
import Summary from '../views/Summary.vue';
import LogicEdit from '../views/LogicEdit.vue';
import UsersEdit from '../views/UsersEdit.vue';
import PropertyEdit from '../views/PropertyEdit.vue';
import SensorEdit from '../views/SensorEdit.vue';

Vue.use(VueRouter)


const routes: Array<RouteConfig> = [
  {
    path: '/',
    redirect: {name: 'Login'}
  },
  {
    path: '/common',
    name: 'DashboardCommon',
    component: DashboardCommon,
    meta: {
      requiresAuth: true,
      isFieldWorker: true
    },
    children: [
      {
        path: ':property', 
        component: AllFields,
        children: [
          {
            path: '',
            component: Field,
            redirect: { path: 'kaikki'}
          },
          {
            name: 'Field',
            path: ':field',
            component: Field,
            props: true
          }
        ]
      }
    ]
  },
  {
    path: '/boss',
    name: 'DashboardBoss',
    component: DashboardBoss,
    meta: {
      requiresAuth: true,
      isManager: true
    },
    children: [
      {
        path: 'property/:property', 
        component: AllFields,
        meta: {
          requiresAuth: true,
          isManager: true,
          breadCrumb(route: Route){ 
            const property = route.params.property;
            return [
              {
                text: i18n.t('navigation.drawerTitles.turf')
              },
              {
                text: property
              }
            ]
          }
        }
      },
      {
        path: 'compare',
        name: 'Compare',
        component: ComparisonTool,
        meta: {
          requiresAuth: true,
          isManager: true,
          breadCrumb(route: Route) { 
            return [
              {
              text: i18n.t('navigation.drawerTitles.compare')
              }
            ]
          }
        }
      }, {
        path: 'summary',
        name: 'Summary',
        component: Summary,
        meta: {
          requiresAuth: true,
          isManager: true,
        }
      }, {
        path: 'settings',
        name: 'Settings',
        component: {
          render: h => h('router-view')
        },
        meta: {
          requiresAuth: true,
          isAdmin: true,
        },
        children: [
          {
            path: 'logic',
            name: 'LogicEdit',
            component: LogicEdit,
            meta: {
              requiresAuth: true,
              isAdmin: true,
              breadCrumb() { 
                return [
                {
                  text: i18n.t('navigation.drawerTitles.systemControl')
                },
                {
                  text: i18n.t('navigation.drawerSubheaders.logic')
                }
              ]}
            }
          },
          {
            path: 'users',
            name: 'UsersEdit',
            component: UsersEdit,
            meta: {
              requiresAuth: true,
              isAdmin: true,
              breadCrumb() { 
                return [
                {
                  text: i18n.t('navigation.drawerTitles.systemControl')
                },
                {
                  text: i18n.t('navigation.drawerSubheaders.users')
                }
              ]}
            }
          },
          {
            path: 'properties',
            name: 'PropertyEdit',
            component: PropertyEdit,
            meta: {
              requiresAuth: true,
              isAdmin: true,
              breadCrumb() { 
                return [
                {
                  text: i18n.t('navigation.drawerTitles.systemControl')
                },
                {
                  text: i18n.t('navigation.drawerSubheaders.property')
                }
              ]}
            }
          }
        ]
      },
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '*',
    alias: '/404',
    name: 'PageNotFound',
    component: PageNotFound
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach(async (to, from, next) => {
  console.log('BeforeEach called ', to)

  // If going to error page, complete no checks
  if (to.path === '/404') {
    next()
  }
  

  /*if (to.params.property && to.params.field) {

  // Retrieve allowed paths from local storage
  const allowedPaths = localStorage.getItem('allowed');
  let parsedAllowedPaths : {property: string, turfs: String[]}[]

  // If allowedPaths was found in local storage, parse it
  if (allowedPaths) {
    parsedAllowedPaths = JSON.parse(allowedPaths)
  } 
  // Else fetch allowed paths from API and save to local storage. This is done to save in loading times so
  // fetching does not have to happen on every page load
  else {
    const allowedProperties : SportsProperty[] = await Vue.$sportsPropertyAPI.getAllSportsProperties()
    const allowedTurfs : Turf[] = await Vue.$sportsPropertyAPI.getAllTurfs()
    console.info('Router before each allowedProperties and allowedTurfs ', allowedProperties, allowedTurfs)

    const allowedPaths = allowedProperties.map(property => {
      const newObject = 
        {
          property: property.path_name,
          turfs: new Array<String>()
        }
      for (const turfIndex in allowedTurfs) {
        if (allowedTurfs[turfIndex].sports_properties_id === property.id) {
          newObject.turfs.push(allowedTurfs[turfIndex].path_name)
        }
      }
      newObject.turfs.push('kaikki')
      return newObject
    })
    localStorage.setItem('allowed', JSON.stringify(allowedPaths))
    parsedAllowedPaths = allowedPaths
    console.log(' Allowed paths ', allowedPaths)
  }

  // Set current path parameters
  const currentProperty = to.params.property
  const currentTurf = to.params.field

  // Check if current path parameters are allowed 
  let pathFound = false;
  for (const i in parsedAllowedPaths) {
    if (parsedAllowedPaths[i].property === currentProperty) {

      for (const turfIndex in parsedAllowedPaths[i].turfs) {
        if (parsedAllowedPaths[i].turfs[turfIndex] === currentTurf) {
            pathFound = true;
            break;
        }
      }
    }
    if (pathFound) {
      break;
    }
  }

  // If current path parameters could not be allowed, go to error page
  if (!pathFound) {
    next({path: '/404'})
  }
}*/

  if(to.matched.some(record => record.meta.requiresAuth)) {
    console.log('Router beforeeach matched requireauth')
      if (localStorage.getItem('access_token') == null || localStorage.getItem('refresh_token') == null) {
          console.log('Token is null router')
          next({
              path: '/login',
              params: { nextUrl: to.fullPath }
          })
      } else {
        let verified : any
        try { 
          const verifiedAccess = await Vue.$authAPI.verify(localStorage.getItem('access_token')!)

          if (!verifiedAccess) {
            console.error('Error verifying token')
            const refresh_response = await Vue.$authAPI.refresh(localStorage.getItem('refresh_token')!)
            localStorage.setItem('access_token', refresh_response.tokens.access_token)
            localStorage.setItem('refresh_token', refresh_response.tokens.refresh_token)
            verified = refresh_response
          } else {
            verified = verifiedAccess
          }
        } finally {
          if (!verified) {
            next({
              path: '/login',
              params: { nextUrl: to.fullPath }
          })
          }
        }
        console.log('access verificaiton', verified)
        if (verified) {
          const user = JSON.parse(localStorage.getItem('user')!)
          type credLevelStrings = keyof typeof CredentialLevel
          const x : credLevelStrings = user.credential_level
          const credLevel : CredentialLevel = CredentialLevel[x]
          console.log('cred levle', credLevel, to.matched)
          if (to.matched.some(record => record.meta.isAdmin)) {
            if(credLevel >= CredentialLevel.admin){
              next()
            }
            else{
                next({ path: '/common'})
            }
          } 
          else if(to.matched.some(record => record.meta.isManager)) {
            console.log('user tpye', CredentialLevel.worker, CredentialLevel.manager)
              if(credLevel >= CredentialLevel.manager){
                  next()
              }
              else{
                  next({ path: '/common'})
              }
          } else {
            console.log('Not manager')
              next()
          }
        } 

          
      }
  } else {
      next()
  }
})

export default router
