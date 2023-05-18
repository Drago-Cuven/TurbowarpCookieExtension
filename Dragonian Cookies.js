
// create by scratch3-extension generator
const ArgumentType = Scratch.ArgumentType;
const BlockType = Scratch.BlockType;
const formatMessage = Scratch.formatMessage;
const log = Scratch.log;

const menuIconURI = null;
const blockIconURI = null;

class DragonianCookies{
  constructor (runtime){
    this.runtime = runtime;
    // communication related
    this.comm = runtime.ioDevices.comm;
    this.session = null;
    this.runtime.registerPeripheralExtension('DragonianCookies', this);
    // session callbacks
    this.reporter = null;
    this.onmessage = this.onmessage.bind(this);
    this.onclose = this.onclose.bind(this);
    this.write = this.write.bind(this);
    // string op
    this.decoder = new TextDecoder();
    this.lineBuffer = '';
  }

  onclose (){
    this.session = null;
  }

  write (data, parser = null){
    if (this.session){
      return new Promise(resolve => {
        if (parser){
          this.reporter = {
            parser,
            resolve
          }
        }
        this.session.write(data);
      })
    }
  }

  onmessage (data){
    const dataStr = this.decoder.decode(data);
    this.lineBuffer += dataStr;
    if (this.lineBuffer.indexOf('\n') !== -1){
      const lines = this.lineBuffer.split('\n');
      this.lineBuffer = lines.pop();
      for (const l of lines){
        if (this.reporter){
          const {parser, resolve} = this.reporter;
          resolve(parser(l));
        };
      }
    }
  }

  scan (){
    this.comm.getDeviceList().then(result => {
        this.runtime.emit(this.runtime.constructor.PERIPHERAL_LIST_UPDATE, result);
    });
  }

  getInfo (){
    return {
      id: 'DragonianCookies',
      name: 'Cookies',
      color1: '#9d7e67',
      color2: '#9d7e67',
      menuIconURI: menuIconURI,
      blockIconURI: blockIconURI,
      blocks: [
        {
          opcode: 'Set Cookie',
          blockType: BlockType.COMMAND,
          arguments: {
            cname: {
              type: ArgumentType.STRING
            },
            cvalue: {
              type: ArgumentType.STRING
            },
            exdays: {
              type: ArgumentType.STRING
            }
          },
          text: 'Set Cookie [cname] to [cvalue] will expire in [exdays] days'
        },
        {
          opcode: 'Get Cookie',
          blockType: BlockType.REPORTER,
          arguments: {
            cname: {
              type: ArgumentType.STRING
            }
          },
          text: 'Get Cookie [cname]'
        }
      ]
    }
  }

Set Cookie (args, util){
  const cname = args.cname;
  const cvalue = args.cvalue;
  const exdays = args.exdays;
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  return this.write(`M0 \n`);
}

Get Cookie (args, util){
  const cname = args.cname;
var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return ca;
}

}

module.exports = DragonianCookies;
