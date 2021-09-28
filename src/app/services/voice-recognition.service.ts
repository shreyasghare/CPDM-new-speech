import { Injectable } from '@angular/core';
interface Window{
  SpeechRecognition : any;
  webkitSpeechRecognition : any;
}
declare let window : Window;

@Injectable({
  providedIn: 'root'
})
export class VoiceRecognitionService {
  recognition : any;
  constructor() { 
    window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    this.recognition = new SpeechRecognition();
  }

  getResult(){
    return new Promise((resolve,reject)=>{
      this.recognition.onaudioend = ()=>{
        this.recognition.onresult = (event)=>{
          resolve(event.results[0][0].transcript);
          console.log(event.results[0][0].transcript);
          this.recognition.stop();
          // this.stop();
          // setTimeout(() => {
          //   this.start();
          // }, 1000);
        }
      }
    });
    
  }

  start(){
    try {
      this.recognition.start();
    } catch (error) {
      this.recognition.stop();
      setTimeout(() => {
        this.recognition.start();
      }, 0);
    }
  }

  stop(){
    this.recognition.stop();
  }
}
