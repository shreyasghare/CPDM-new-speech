import { Injectable } from '@angular/core';

interface Window{
  speechSynthesis:any;
}
declare let window : Window;

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {

  synth : any;
  constructor() { 
    this.synth = window.speechSynthesis;
  }

  speak(action){
    let utterThis = new SpeechSynthesisUtterance(action);
    // utterThis.lang = 'en-GB';
    this.synth.speak(utterThis);
  }
  
}
