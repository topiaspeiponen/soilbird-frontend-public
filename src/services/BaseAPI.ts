import axios, { AxiosInstance, AxiosResponse } from "axios";
import { SoilscoutMeasurement, SoilscoutDevice, SoilscoutGroup } from './SoilscoutAPIResponseTypes';
import StringLibrary from "../static/StringLibrary";
import Vue from "vue";

export class BaseAPI {
    public instance : AxiosInstance
    constructor() {
      console.log('Base api constructor')
        this.instance = axios.create({
            baseURL: process.env.BASE_URL,
            timeout: 10000
          });
    }
      async init() {
        // Set up interceptor before sending requests from our instance
        this.instance.interceptors.request.use(
          (config) => {
            console.log('Interceptor attaching tokens to request')
            const token = localStorage.getItem("access_token");
            if (token && config.headers.Retry !== true) {
              config.headers = {
                Authorization: "Bearer " + token,
                Retry: false
              };
            } else if (token && config.headers.Retry === true) {
              config.headers = {
                Authorization: "Bearer " + token,
                Retry: true
              }
            }
            return config;
          },
          (error) => {
            return Promise.reject(error);
          }
        );
    
        // Set up interceptor for responses to retry requests in case token was expired
        this.instance.interceptors.response.use(
          (response) => {
            return response
          },
          async (error) => {
            const originalRequest = error.config;
            console.log('Response config ', originalRequest)
    
            // If error was due to token expiration (status code 401) and original request wasnt a retry request
            if (error.response.status === 401 && originalRequest.headers.Retry === false) {
              originalRequest.headers.Retry = true
              const refresh = localStorage.getItem('refresh_token')
              if (refresh) {
                await Vue.$authAPI.refresh(refresh).then((response) => {
                  localStorage.setItem('access_token', response.tokens.access_token)
                  localStorage.setItem('refresh_token', response.tokens.refresh_token)
                })
                
                return new Promise((resolve, reject) => {
                  this.instance.request(originalRequest).then(response => {
                    resolve(response);
                  }).catch((error) => {
                    reject(error);
                  })
                })
              }
            }
          }
        );    
      }
  
    }