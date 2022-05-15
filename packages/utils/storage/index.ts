import { generateCurrentTimestamps } from '../date';
import { isDev } from '../_utils/env';

export type StorageType = 'session' | 'local';
export type StorageFn =
   WindowLocalStorage['localStorage']
   | WindowSessionStorage['sessionStorage'];
export type FnsMap = Record<keyof StorageType, StorageFn>;
export interface StorageSetOptions<T>{
  value?: T
  expired?: number
  now?: number
}
export interface StorageOptions{
  type: StorageType
}

export class Storage{
  protected defaultConfig: StorageOptions = {
    'type': 'local',
  };
  private _type: StorageType;
  private _storage?: StorageFn;
  constructor(options?: StorageOptions){
    const defaultOptions = Object.assign(this.defaultConfig,options ?? {});
    this._type = defaultOptions.type;
    this.initStorage();
  }

  public initStorage(){
    if(!window && isDev()){
      console.error('Please use it in a browser environment!');
      return;
    }
    this._storage = this.type === 'local' ? window.localStorage : window.sessionStorage;
  }

  public setItem<T>(key: string,value: any,options?: StorageSetOptions<T>): void{
    const data = {
      value,
      'expired': options?.expired ?? null,
      'now':generateCurrentTimestamps(),
    };
    this.storage?.setItem(key,JSON.stringify(data));
  }

  public getItem<T>(key: string): null | T{
    const data = this.storage?.getItem(key);
    if(data){
      const saveValue = JSON.parse(data) as Required<StorageSetOptions<T>>;
      const currentTimestamps = generateCurrentTimestamps();
      return currentTimestamps - saveValue.now > saveValue.expired ? saveValue.value : null;
    }
    return null;
  }

  get type(){
    return this._type;
  }

  get storage(){
    return this._storage;
  }
}

export type StorageInstance = Storage;

const instance = () => {
  let instance: null | Storage = null;
  return (options: StorageOptions): Storage => {
    if(!instance){
      instance = new Storage(options);
    }
    return instance;
  };
};

export const useStorage = instance();