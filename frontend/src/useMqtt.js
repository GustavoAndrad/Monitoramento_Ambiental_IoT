import { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';
import { climaSubject } from './climaSubject';

export function useMqtt() {
  

  useEffect(() => {


    clientRef.current = client;

    
  }, []);

  return { ultimoDado };
}