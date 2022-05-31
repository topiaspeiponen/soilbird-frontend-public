import axios, { AxiosInstance, AxiosResponse } from "axios";
import { SoilscoutMeasurement, SoilscoutDevice, SoilscoutGroup } from './SoilscoutAPIResponseTypes';
import StringLibrary from "../static/StringLibrary";
import Vue from "vue";

const baseURL = process.env.BASE_URL

/**
 * Handles application authentication logic.
 * 
 * Uses stand-alone axios instances to make network calls so that
 * external axios interceptors don't interfere.
 */
export class AuthAPI {

      async login(username: string, password: string) {
        try {
            console.log('Login authapi ', username, password)
            const response = await axios.post(baseURL + 'users/auth/login', {
                    username: username,
                    password: password 
            });
            console.log('AUTHAPI', response)
            return response.data
        } catch(err) {
            console.log('Login error ', err)
            return null
        }
      }

      async refresh(refresh: string) {
        try {
          const response = await axios.get(baseURL + 'users/auth/refresh', {headers: {
            'Authorization': 'Bearer ' + refresh
          }})
          return response.data
        } catch(err) {
          console.log('Error refreshing token ', err)
          return null
        }
      }

      async verify(token: string) {
        try {
          const response = await axios.get(baseURL + 'users/auth/verify/', {
            params: {
              "token" : token
            }
          })
          return response.data
        } catch(err) {
          console.log('Error refreshing token ', err)
          return null
        }
      }
    }