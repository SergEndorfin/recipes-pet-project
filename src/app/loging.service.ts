export class LogingService {
  lastLog: string;
  count = 0;

  printLog(msg: string) {
    console.log('last >', this.lastLog, this.count++);
    console.log('current >', msg, this.count);
    this.lastLog = msg;
  }
}
