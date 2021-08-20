import Dexie from 'dexie';

export interface ApolloCache {
  id?: number; // make id optional because when create a data, typescript will still require this one XD
  data: string;
}
export class ApolloCacheDB extends Dexie {
  public getUserData: Dexie.Table<ApolloCache, number>; // id is number in this case
  public getUserInfoData: Dexie.Table<ApolloCache, number>;
  public getUserInfoStarred: Dexie.Table<ApolloCache, number>;
  public getSeen: Dexie.Table<ApolloCache, number>;
  public getSearches: Dexie.Table<ApolloCache, number>;
  public getClicked: Dexie.Table<ApolloCache, number>;

  public constructor() {
    super('ApolloCacheDB');
    // @ts-ignore
    this.autoOpen = false;

    this.version(1).stores({
      getUserData: '++id,data',
      getUserInfoData: '++id,data',
      getUserInfoStarred: '++id,data',
      getSeen: '++id,data',
      getSearches: '++id,data',
      getClicked: '++id,data',
    });

    this.getClicked = this.table('getClicked');
    this.getUserInfoData = this.table('getUserInfoData');
    this.getUserInfoStarred = this.table('getUserInfoStarred');
    this.getSeen = this.table('getSeen');
    this.getSearches = this.table('getSearches');
    this.getUserData = this.table('getUserData');
  }
  public match(key: string) {
    switch (key) {
      case 'getClicked':
        return this.getClicked;
      case 'getUserInfoData':
        return this.getUserInfoData;
      case 'getUserInfoStarred':
        return this.getUserInfoStarred;
      case 'getSeen':
        return this.getSeen;
      case 'getSearches':
        return this.getSearches;
      case 'getUserData':
        return this.getUserData;
    }
  }
}
