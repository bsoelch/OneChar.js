let memory=new Map();
let valueStack=[];
let callStack=[];
let sourceCode=""

const utf8Decode=new TextDecoder('utf-8');
const utf8Encode=new TextEncoder('utf-8');

function readMemory(p){
  let x=memory.get(p);
  if(x===undefined)
    return 0n;
  return x;
}
function truncateToBits(v){
  if(bits<=0n)
    return v;
  v=v&((1n<<bits)-1n);
  if(v>=1n<<(bits-1n))
    v=-((-v)&((1n<<bits)-1n));
  return v;
}
function writeMemory(p,v){
  if(bits>0n)
    v=truncateToBits(v);
  if(v==0n)
    memory.delete(p);
  else
    memory.set(p,v);
}

function valCount(){
  return valueStack.length;
}
function pushValue(val){
  if(bits>0n)
    val=truncateToBits(val);
  if(val!==BigInt(val))
    throw "No int";
  if((language&LANG_FLAG_STACK)==0)
    return writeMemory(mp,val);
  valueStack.push(val);
}
function popValue(val){
  if((language&LANG_FLAG_STACK)==0)
    return readMemory(mp);
  if(valueStack.length<=0)
    return 0n;
  return valueStack.pop();
}
function peekValue(val){
  if((language&LANG_FLAG_STACK)==0)
    return readMemory(mp);
  if(valueStack.length<=0)
    return 0n;
  return valueStack.at(-1);
}
function callStackEmpty(){
  return callStack.length<=0;
}
function callStackPush(pos){
  callStack.push(pos);
}
function callStackPop(){
  if(callStackEmpty()){
    console.error("call-stack underflow");
    return -1n;
  }
  return callStack.pop();
}
function callStackPeek(){
  if(callStackEmpty()){
    console.error("call-stack underflow");
    return -1n;
  }
  return callStack.at(-1);
}


function getchar(){
  return BigInt(stdinRead());
}
function putchar(c){
  return stdoutWrite(Number(c&0xffn));
}

function ord(s){
  return BigInt(s.codePointAt(0));
}
function loadProgram(code){
  if(language&LANG_CODE_UNICODE){//UTF-32
      sourceCode=[...code].map(c=>ord(c));
    }else{//UTF-8
      sourceCode=[...utf8Encode.encode(code)].map(c=>BigInt(c))
    }
  if(language&LANG_FLAG_SELF_MODIFICATION){//load program into memory
    let p=-1n;
    sourceCode.forEach((c)=>{
      writeMemory(p--,c);
    });
  }
}

const BLOCK_TYPE_IF=0;
const BLOCK_TYPE_FOR=2;
const BLOCK_TYPE_PROC=3;

function blockTypeName(blockType){
  switch(blockType){
    case BLOCK_TYPE_IF:
      return "[]";
    case BLOCK_TYPE_FOR:
      return "()";
    case BLOCK_TYPE_PROC:
      return "{}";
    default:
      return "\"unknown block type\"";
  }
}

function ipow(a,e){
  return a**e;
}
function lshift(a,b){
  if(b==0)
    return a;
  if(b>0){
    return a<<b;
  }else{
    return a>>>-b;
  }
}
function rshift(a,b){
  if(b==0)
    return a;
  if(b>0){
    return a>>>b;
  }else{
    return a<<-b;
  }
}

const LANG_FLAG_STACK=0x1;
const LANG_MASK_WHILE_LOOPS=0xc;
const LANG_FLAG_WHILE=0x4;
const LANG_FLAG_IF=0x8;
const LANG_MASK_FOR_LOOPS=0x30;
const LANG_FLAG_FOR=0x10;
const LANG_FLAG_FORWHILE=0x20;
const LANG_FLAG_PROCS=0x40;
const LANG_FLAG_FLAT_PROCS=0xc0;
const LANG_FLAG_COMMENTS=0x100;
const LANG_FLAG_INTS=0x200;
const LANG_FLAG_STRINGS=0x400;
const LANG_FLAG_SELF_MODIFICATION=0x800;
const LANG_FLAG_POP_PRINT=0x1000;
const LANG_FLAG_FLIP=0x2000;
const LANG_FLAG_NOT=0x4000;
const LANG_FLAG_FLIP_NEGATIVE_LOOP=0x8000;// swap + and - if loop counter is negative
const LANG_CODE_UNICODE=0x10000;//read source-code as Unicode code-points instead of bytes
const LANG_FLAG_MIXED_LOOPS=0x20000;//allow (] and [) loops
//XXX? code-point IO

const LANG_MASK_COMPOSITES=LANG_FLAG_COMMENTS|LANG_FLAG_INTS|LANG_FLAG_STRINGS;

//TODO check if languages are working correctly 
const LANG_ONE_CHAR=LANG_FLAG_STACK|LANG_FLAG_WHILE|LANG_FLAG_FOR|LANG_FLAG_PROCS|LANG_MASK_COMPOSITES|LANG_FLAG_POP_PRINT|LANG_FLAG_NOT|LANG_FLAG_FLIP|LANG_FLAG_SELF_MODIFICATION;
const LANG_FOR_WHILE=LANG_FLAG_STACK|LANG_FLAG_IF|LANG_FLAG_FORWHILE|LANG_FLAG_FLAT_PROCS|LANG_MASK_COMPOSITES|LANG_FLAG_NOT|LANG_FLAG_FLIP|LANG_FLAG_SELF_MODIFICATION|LANG_FLAG_MIXED_LOOPS;
const LANG_BF=LANG_FLAG_WHILE;
const LANG_BRAIN_FOR_WHILE=LANG_FLAG_IF|LANG_FLAG_FORWHILE|LANG_FLAG_FLIP_NEGATIVE_LOOP;
let language=LANG_ONE_CHAR;
let bits=0n;

function langOneChar(){
  language=LANG_ONE_CHAR;
  bits=0n;
}
function langForWhile(){
  language=LANG_FOR_WHILE;
  bits=0n;
}
function langBrainfuck(){
  language=LANG_BF;
  bits=8n;
}
function langBrainForWhile(){
  language=LANG_BRAIN_FOR_WHILE;
  bits=0n;
}
langForWhile();

//program state
let ip=-1n;//instruction pointer
let mp=0n;
let callDepth=0;
let maxCallDepth=3;
let skipCount=0;
let comment=false;
let blockComment=false;
let stringMode=false;
let numberMode=false;
let escapeMode=false;
let flipSigns=false;

let command=0n;
let type=0n;
let running;
function initProgram(){
  memory=new Map();
  valueStack=[];
  callStack=[];
  //setup program state
  ip=-1n;//instruction pointer
  mp=0n;//memory pointer (bf-mode only)
  callDepth=0;
  skipCount=0;
  comment=false;
  blockComment=false;
  stringMode=false;
  numberMode=false;
  escapeMode=false;
  flipSigns=false;

  command=0n;
  type=0n;
  maxCallDepth=3
  running=true;
}

function readInstruction(ip){
  if(language&LANG_FLAG_SELF_MODIFICATION)
    return readMemory(ip);
  //-1 -> - code.length
  ip=-(ip+1n);
  if(ip<0||ip>=sourceCode.length)
    return 0n;
  return sourceCode[Number(ip)];
}

function stepProgram(){//XXX? use flipSigns on more instructions
  command=readInstruction(ip--)&0xffn;
  if(command==ord('\0')){
    running=false;
    return;//reached end of program
  }
  if((language&LANG_FLAG_COMMENTS)&&blockComment){
    if(command!=ord('\\'))
      return;
    if(command==ord('\\')&&readInstruction(ip--)==ord('\\')){
      comment=false;
      blockComment=false;
    }
    return;
  }
  if((language&LANG_FLAG_COMMENTS)&&comment){
    if(command==ord('\n'))
      comment=false;
    return;
  }
  if((language&LANG_FLAG_STRINGS)&&stringMode){
    if(escapeMode){
      escapeMode=false;
      if(skipCount>0)
        return;//string in skipped loop
      switch(command){
      case ord('"'):
        pushValue(ord('"'));
        break;
      case ord('\\'):
        pushValue(ord('\\'));
        break;
      case ord('n'):
        pushValue(ord('\n'));
        break;
      case ord('t'):
        pushValue(ord('\t'));
        break;
      case ord('r'):
        pushValue(ord('\r'));
        break;//more escape sequences
      default:
        console.error("unsupported escape sequence: \\"+String.fromCharCode(command)+"\n");
      }
    }else if(command==ord('\\')){
      escapeMode=true;
    }else if(command==ord('"')){
      stringMode=false;
      if(skipCount>0)
        return;//string in skipped loop
      let tmp=((language&LANG_FLAG_STACK)?valCount():mp)-callStackPop();
      pushValue(BigInt(tmp));
    }else{
      if(skipCount>0)
        return;//string in skipped loop
      pushValue(command);
    }
    if(stringMode&(language&LANG_FLAG_STACK)==0)
      mp++;//increment memory pointer
    return;
  }
  if(skipCount>0){
    switch(command){
      case ord('['):
        if((language&LANG_MASK_WHILE_LOOPS)==0)
          break;
        callStackPush(BLOCK_TYPE_IF);
        skipCount++;
        break;
      case ord('('):
        if((language&LANG_MASK_FOR_LOOPS)==0)
          break;
        callStackPush(BLOCK_TYPE_FOR);
        skipCount++;
        break;
      case ord('{'):
        if((language&LANG_FLAG_PROCS)==0)
          break;
        callStackPush(BLOCK_TYPE_PROC);
        skipCount++;
        break;
      case ord(']'):
        if((language&LANG_MASK_WHILE_LOOPS)==0)
          break;
        type=callStackPop();
        if(type!=BLOCK_TYPE_IF&&((language&LANG_FLAG_MIXED_LOOPS)==0||type!=BLOCK_TYPE_FOR)){
          running=false;
          console.error("unexpected ']' in '"+blockTypeName(type)+"' block\n");return;
        }
        skipCount--;
        break;
      case ord(')'):
        if((language&LANG_MASK_FOR_LOOPS)==0)
          break;
        type=callStackPop();
        if(type!=BLOCK_TYPE_FOR&&((language&LANG_FLAG_MIXED_LOOPS)==0||type!=BLOCK_TYPE_IF)){
          running=false;
          console.error("unexpected ')' in '"+blockTypeName(type)+"' block\n");return;
        }
        skipCount--;
        break;
      case ord('}'):
        if((language&LANG_FLAG_PROCS)==0)
          break;
        type=callStackPeek();
        if(type==BLOCK_TYPE_PROC){// } only closes current procedure when it is not contained in sub-block
          callStackPop();
          skipCount--;
        }
        break;
      case ord('"'):
        if((language&LANG_FLAG_STRINGS)==0)
          break;
        stringMode=true;
        break;
      case ord('\\'):
        if((language&LANG_FLAG_COMMENTS)==0)
          break;
        comment=true;
        if(readInstruction(ip--)==ord('\\')){// \\ -> block comment
          blockComment=true;
        }
        break;
    }
    return;
  }
  if(language&LANG_FLAG_INTS){
    if(command>=ord('0')&&command<=ord('9')){
      if(numberMode){
        let v=popValue();
        pushValue(10n*v+command-ord('0'));
      }else{
        pushValue(command-ord('0'));
        numberMode=true;
      }
      return;
    }
    numberMode=false;
  }
  switch(command){
    case ord('0'):case ord('1'):case ord('2'):case ord('3'):case ord('4'):
    case ord('5'):case ord('6'):case ord('7'):case ord('8'):case ord('9')://digits have already been handled
    case ord(' ')://ignore spaces
      break;
    //strings&comments
    case ord('"'):
      if((language&LANG_FLAG_STRINGS)==0)
        break;
      callStackPush((language&LANG_FLAG_STACK)?valCount():mp);
      stringMode=true;
      break;
    case ord('\\'):
      if((language&LANG_FLAG_COMMENTS)==0)
        break;
      comment=true;
      if(readInstruction(ip--)==ord('\\')){// \\ -> block comment
        blockComment=true;
      }
      break;
    //control flow
    case ord('['):{
      if((language&LANG_MASK_WHILE_LOOPS)==0)
        break;
      let n=popValue();
      if(n!=0n){
        if(language&LANG_FLAG_MIXED_LOOPS){
          callStackPush(ip);
          callStackPush(n);
        }else if(language&LANG_FLAG_WHILE){
          callStackPush(ip);
        }
        callStackPush(BLOCK_TYPE_IF);
      }else{
        skipCount=1;
        callStackPush(BLOCK_TYPE_IF);
      }
      }break;
    case ord(']'):{
      if((language&LANG_MASK_WHILE_LOOPS)==0)
        break;
      type=callStackPop();
      let n=(language&LANG_FLAG_MIXED_LOOPS)?callStackPop():0;
      if(type==BLOCK_TYPE_FOR&&(language&LANG_FLAG_MIXED_LOOPS)){
        let x=(language&LANG_FLAG_FORWHILE)?1n:popValue();
        n--;
        if(n>0n&&x!=0n){
          ip=callStackPeek();
          callStackPush(n);
          callStackPush(type);
          pushValue(n);
        }else{
          callStackPop();
          if(language&LANG_FLAG_FLIP_NEGATIVE_LOOP){
            flipSigns=callStackPop();
          }
        }
        break;
      }
      if(type!=BLOCK_TYPE_IF){
        running=false;
        console.error("unexpected ']' in '"+blockTypeName(type)+"' block\n");return;
      }
      if(language&LANG_FLAG_WHILE){
        if(popValue()!=0n){
          ip=callStackPeek();
          callStackPush(type);
        }else{
          callStackPop();
        }
      }else if(language&LANG_FLAG_MIXED_LOOPS){
        callStackPop();
      }
      }break;
    case ord('('):{
      if((language&LANG_MASK_FOR_LOOPS)==0)
        break;
      let n=popValue();
      if(language&LANG_FLAG_FLIP_NEGATIVE_LOOP){
        if(n!=0n)//don't push old sign if n==0
          callStackPush(flipSigns);
        if(n<0n){
          flipSigns=!flipSigns;
          n=-n;
        }
      }
      if(n>0n){
        callStackPush(ip);
        callStackPush(n);
        callStackPush(BLOCK_TYPE_FOR);
        if(language&LANG_FLAG_STACK)
          pushValue(n);
      }else{
        skipCount=1;
        callStackPush(BLOCK_TYPE_FOR);
      }
      }break;
    case ord(')'):{
      if((language&LANG_MASK_FOR_LOOPS)==0)
        break;
      type=callStackPop();
      if(type!=BLOCK_TYPE_FOR&&(((language&LANG_FLAG_MIXED_LOOPS)==0)||(type!=BLOCK_TYPE_IF))){
        running=false;
        console.error("unexpected ')' in '"+blockTypeName(type)+"' block\n");return;
      }
      let n=callStackPop();
      let x=(language&LANG_FLAG_FORWHILE)?popValue():1n;
      n--;
      if(x!=0n&&n>0n){
        ip=callStackPeek();
        callStackPush(n);
        callStackPush(type);
        if((language&LANG_FLAG_STACK)&&type==BLOCK_TYPE_FOR)
          pushValue(n);
      }else{
        callStackPop();//ip
        if((language&LANG_FLAG_FLIP_NEGATIVE_LOOP)&&type==BLOCK_TYPE_FOR){
          flipSigns=callStackPop();
        }
      }
      }break;
    case ord('{'):
      if((language&LANG_FLAG_PROCS)==0)
        break;
      pushValue(ip);
      skipCount=1;
      callStackPush(BLOCK_TYPE_PROC);
      break;
    case ord('}'):
      if((language&LANG_FLAG_PROCS)==0)
        break;
      do{
        if(callStackEmpty()){
          console.error("unexpected '}'\n");
          runnint=false;
          return;
        }
        type=callStackPop();//pop blocks until {} block is reached
        switch(type){//pop remaining values in block
          case BLOCK_TYPE_PROC:
            break;
          case BLOCK_TYPE_IF:
            if(language==LANG_ONE_CHAR){
              callStackPop();
            }
            break;
          case BLOCK_TYPE_FOR:
            callStackPop();
            callStackPop();
            break;
        }
      }while(type!=BLOCK_TYPE_PROC);
      ip=callStackPop();//return
      callDepth--;
      break;
    case ord('?'):{
      if((language&LANG_FLAG_PROCS)==0)
        break;
      let to=popValue();
      if(((language&LANG_FLAG_FLAT_PROCS)==0)||callDepth<maxCallDepth){
        callStackPush(ip);
        callStackPush(BLOCK_TYPE_PROC);
        callDepth++;
        ip=to;
      }
      }break;
    //stack manipulation
    case ord('.'):;//drop   ## a ->
      if(language&LANG_FLAG_STACK){
        popValue();
      }else{
        let v=(language&LANG_FLAG_POP_PRINT)?popValue():peekValue();
        putchar(v&0xffn);
      }
      break;
    case ord(':'):
      if(language&LANG_FLAG_STACK){//dup   ## a -> a
        let a=peekValue();
        pushValue(a);
        break;
      }
      break;
    case ord('\''):
      if(language&LANG_FLAG_STACK){//swap ## b a -> a b
        let b=popValue();
        let a=popValue();
        //re-definable combinations '+ '* '& '| '^ '=  '' as modifier
        if(readInstruction(ip)==ord('>')){//'> can be expressed as <  => can use for bit-shift
          ip--;
          pushValue(rshift(a,b));
          break;
        }else if(readInstruction(ip)==ord('<')){//'< can be expressed as >  => can use for bit-shift
          ip--;
          pushValue(lshift(a,b));
          break;
        }//XXX? ''/ ''% -> unsigned division/modulo
        pushValue(b);
        pushValue(a);
        break;
      }
      break;
    case ord(';'):
      if(language&LANG_FLAG_STACK){//over ## c b a -> c b a c
        let a=popValue();
        let c=peekValue();
        pushValue(a);
        pushValue(c);
        break;
      }
      break;
    case ord(','):
      if(language&LANG_FLAG_STACK){//rotate .. ## a b c -> b c a
        let count=Number(popValue());
        if(count==0)
          break;
        if(count>0){
          if(count>valCount()){//TODO handle value-stack underflow correctly
            running=false;
            console.error("stack underflow");
            return;
          }
          let a=valueStack[valueStack.length-count];// ^ 1 2 3
          for(let i=count;i>1;i--){
            valueStack[valueStack.length-i]=valueStack[valueStack.length-(i-1)];
          }
          valueStack[valueStack.length-1]=a;
        }else{
          count=-count;
          if(count>valCount()){
            running=false;
            console.error("stack underflow");
            return;
          }
          let a=valueStack[valueStack.length-1]; // ^ 1 2 3
          for(let i=1;i<count;i++){
            valueStack[valueStack.length-i]=valueStack[valueStack.length-(i+1)];
          }
          valueStack[valueStack.length-count]=a;
        }
      }else{//no stack -> bf IO
        pushValue(getchar());
      }
      break;
    //memory
    case ord('@'):
      if(language&LANG_FLAG_STACK){
        let addr=popValue();
        pushValue(readMemory(addr));
        break;
      }
      break;
    case ord('$'):
      if(language&LANG_FLAG_STACK){
        let addr=popValue();
        writeMemory(addr,popValue());
        break;
      }
      break;
    //arithmetic operations
    case ord('+'):
      if(language&LANG_FLAG_STACK){
        let b=popValue();
        let a=popValue();
        pushValue(a+b);
        break;
      }
      writeMemory(mp,readMemory(mp)+(flipSigns?-1n:1n));
      break;
    case ord('-'):
      if(language&LANG_FLAG_STACK){
        let b=popValue();
        let a=popValue();
        pushValue(a-b);
        break;
      }
      writeMemory(mp,readMemory(mp)-(flipSigns?-1n:1n));
      break;
    case ord('*'):
      if(language&LANG_FLAG_STACK){
        let b=popValue();
        let a=popValue();
        pushValue(a*b);
        break;
      }
      break;
    case ord('/'):
      if(language&LANG_FLAG_STACK){
        let b=popValue();
        let a=popValue();
        pushValue(b==0n?0n:a/b);
        break;
      }
      break;
    case ord('%'):
      if(language&LANG_FLAG_STACK){
        let b=popValue();
        let a=popValue();
        pushValue(b==0n?a:a%b);
        break;
      }
      break;
    case ord('>'):
      if(language&LANG_FLAG_STACK){
        let b=popValue();
        let a=popValue();
        pushValue(a>b?1n:0n);
        break;
      }
      mp++;
      break;
    case ord('<'):
      if(language&LANG_FLAG_STACK){
        let b=popValue();
        let a=popValue();
        pushValue(a<b?1n:0n);
        break;
      }
      mp--;
      break;
    case ord('='):
      if(language&LANG_FLAG_STACK){
        let b=popValue();
        let a=popValue();
        pushValue(a==b?1n:0n);
        break;
      }
      break;
    case ord('&'):
      if(language&LANG_FLAG_STACK){
        let b=popValue();
        let a=popValue();
        pushValue(a&b);
        break;
      }
      break;
    case ord('|'):
      if(language&LANG_FLAG_STACK){
        let b=popValue();
        let a=popValue();
        pushValue(a|b);
        break;
      }
      break;
    case ord('^'):
      if(language&LANG_FLAG_STACK){
        let b=popValue();
        let a=popValue();
        pushValue(a^b);
        break;
      }
      break;
    case ord('`'):
      if(language&LANG_FLAG_STACK){
        let b=popValue();
        let a=popValue();
        pushValue(ipow(a,b));
        break;
      }
      break;
    case ord('!'):
      if(language&LANG_FLAG_NOT){
        let a=popValue();
        pushValue(a==0n?1n:0n);
        break;
      }
      break;
    case ord('~'):
      if(language&LANG_FLAG_FLIP){
        let a=popValue();
        if(readInstruction(ip)==ord('~')){//~~ would have has no effect -> use combination for negation
          ip--;
          pushValue(-a);
          break;
        }
        pushValue(~a);
        break;
      }
      break;
    case ord('_'):
      if(language&LANG_FLAG_STACK){
        pushValue(getchar());
        break;
      }
      break;
    case ord('#'):
      if(language&LANG_FLAG_STACK){
        let v=(language&LANG_FLAG_POP_PRINT)?popValue():peekValue();
        putchar(v);
        break;
      }
      break;
    default:
      break;
  }
}

//XXX? run program asynchronously 
let progId=0;
window.addEventListener(//post message is faster than setTimeout/setInterval
  "message",
  (event) => {
    if (event.data !== progId) return;
    stepProgram();
    if(running)
      postMessage(progId);
  },
  false
);
function runProgram(){
  postMessage(progId);
}
