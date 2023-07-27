
class Matrix{
  constructor(rows){
    this.rows=rows;
    this.nrows=rows.length;
    this.ncolums=Math.max(...rows.map(r=>r.length));
  }
  at(row,colum){
    if(row<0||row>=this.nrows)
      return 0n;
    if(colum<0||colum>=this.rows[row].length)
      return 0n;
    return this.rows[row][colum];
  }
  toString(){
    let s="("
    this.rows.forEach(r=>{r.forEach(e=>{s+=e+" ";});s=(r.length>0?s.substring(0,s.length-1):s)+",";});
    return s.substring(0,s.length-1)+")";
  }
}
function itrLang_popStack(){
  if(stackStack.length>0)
    return stackStack.pop();
  return [];
}
function itrLang_pushValue(val){
  valueStack.push(val);
}
function itrLang_popValue(val){
  if(valueStack.length<=0)
    return 0n;
  return valueStack.pop();
}
function itrLang_peekValue(val){
  if(valueStack.length<=0)
    return 0n;
  return valueStack.at(-1);
}
function itrLang_printValue(val){
  if(val instanceof Array){//XXX string mode
    let first=true;
    val.forEach((e)=>{putchar(ord(first?'(':' '));itrLang_printValue(e);first=false;});
    if(first)
      putchar(ord('('));
    putchar(ord(')'));
    return;
  }
  [...val.toString()].forEach((c)=>putchar(ord(c)));
}

function itrLang_isnumber(e){
  return typeof e === "bigint";//XXX fraction,complex,real
}
function itrLang_ismatrix(e){
  if(itrLang_isnumber(e))
    return true;
  return e instanceof Matrix;
}
function itrLang_asArray(x){
  if(x instanceof Array)
    return x;
  return [x];
}
function unaryMatrixOp(M,f){
  if(!(M instanceof Matrix))
    throw `unsupported types for matrix operation: ${a.constructor.name}`;
  let res=new Array(M.nrows);
  for(let i=0;i<M.nrows;i++){
    res[i]=new Array(M.ncolums);
    for(let j=0;j<M.ncolums;j++)res[i][j]=f(M.at(i,j));
  }
  return new Matrix(res);
}
function pointwiseMatrixOp(a,b,f){
  if(a instanceof Matrix&&b instanceof Matrix){
    let rows=Math.max(a.nrows,b.nrows);
    let colums=Math.max(a.ncolums,b.ncolums);
    let res=new Array(rows);
    for(let i=0;i<rows;i++){
      res[i]=new Array(colums);
      for(let j=0;j<colums;j++)res[i][j]=f(a.at(i,j),b.at(i,j));
    }
    return new Matrix(res);
  }
  if(a instanceof Matrix){
    let res=new Array(a.nrows);
    for(let i=0;i<a.nrows;i++){
      res[i]=new Array(a.ncolums);
      for(let j=0;j<a.ncolums;j++)res[i][j]=f(a.at(i,j),b);
    }
    return new Matrix(res);
  }
  if(b instanceof Matrix){
    let res=new Array(b.nrows);
    for(let i=0;i<b.nrows;i++){
      res[i]=new Array(b.ncolums);
      for(let j=0;j<b.ncolums;j++)res[i][j]=f(a,b.at(i,j));
    }
    return new Matrix(res);
  }
  throw `unsupported types for matrix operation: ${a.constructor.name} and ${b.constructor.name}`;
}
function itrLang_add(a,b){
  if(typeof a === "bigint"&&typeof b === "bigint"){//XXX other number types
    return a+b;
  }
  if(itrLang_ismatrix(a)&&itrLang_ismatrix(b)){
    return pointwiseMatrixOp(a,b,(x,y)=>itrLang_add(x,y));
  }
  if(a instanceof Array&&b instanceof Array){
    return a.concat(b);
  }
  if(a instanceof Array||b instanceof Array){
    let array=itrLang_asArray(a);
    return array.concat(itrLang_asArray(b));
  }
  throw `incompatible types for addition: ${a.constructor.name} and ${b.constructor.name}`;
}
function itrLang_subtract(a,b){
  if(typeof a === "bigint"&&typeof b === "bigint"){
    return a-b;
  }
  if(itrLang_ismatrix(a)&&itrLang_ismatrix(b)){
    return pointwiseMatrixOp(a,b,(x,y)=>itrLang_minus(x,y));
  }
  if(a instanceof Array||b instanceof Array){
    let res=[];let arrayB=itrLang_asArray(b);
    itrLang_asArray(a).forEach(e=>{if(arrayB.indexOf(e)<0)res.push(e);});
    return res;
  }
  throw `incompatible types for subtraction: ${a.constructor.name} and ${b.constructor.name}`;
}
function itrLang_compare(a,b,cond){
  if(typeof a === "bigint"&&typeof b === "bigint"){
    return cond(a-b);
  }
  if(itrLang_ismatrix(a)&&itrLang_ismatrix(b)){
    return pointwiseMatrixOp(a,b,(x,y)=>itrLang_compare(x,y,cond));
  }
  //TODO array comparison (lexicographical)
  throw `incompatible types for comparison: ${a.constructor.name} and ${b.constructor.name}`;
}
function itrLang_asBool(a){
  if(typeof a === "bigint"){
    return a!=0;
  }
  if(itrLang_ismatrix(a)){
    isTrue=false;
    a.rows.forEach(r=>r.forEach(e=>isTrue|=itrLang_asBool(e)));
    return isTrue;
  }
  if(a instanceof Array){
    isTrue=false;
    a.forEach(e=>isTrue|=itrLang_asBool(e));
    return isTrue;
  }
  throw `unsupported type for unary operation: ${a.constructor.name}`;
}
function itrLang_not(a){
  if(typeof a === "bigint"){
    return BigInt(a==0n);
  }
  if(itrLang_ismatrix(a)){
    return unaryMatrixOp(a,x=>itrLang_not(x));
  }
  if(a instanceof Array){
    let res=[];
    itrLang_asArray(a).forEach(e=>res.push(itrLang_not(e)));
    return res;
  }
  throw `unsupported type for unary operation: ${a.constructor.name}`;
}
function itrLang_negate(a){
  if(typeof a === "bigint"){
    return -a;
  }
  if(itrLang_ismatrix(a)){
    return unaryMatrixOp(a,x=>itrLang_negate(x));
  }
  if(a instanceof Array){
    let res=[];
    itrLang_asArray(a).forEach(e=>res.push(itrLang_negate(e)));
    return res;
  }
  throw `unsupported type for unary operation: ${a.constructor.name}`;
}

function itrLang_stepProgram(){
  command=readInstruction(ip++)&0xffn;
  if(command==ord('\0')){
    running=false;
    //output top stack element
    itrLang_printValue(itrLang_peekValue());
    return;//reached end of program
  }
  if(comment){
    if(command==ord('\n'))
      comment=false;
    return;
  }
  if(stringMode){
    if(command!=ord('\\')){
      if(skipCount==0)
        itrLang_pushValue(command);
      return
    }
    command=readInstruction(ip);
    if(command==ord('\\')){// \\ -> escaped backslash
      ip++;
      if(skipCount==0)
        itrLang_pushValue(command);
      return;
    }
    if(skipCount==0){
      let prevStack=itrLang_popStack();
      prevStack.push(valueStack);
      valueStack=prevStack;
    }
    stringMode=false;
    return;
  }
  if(skipCount>0){
    //TODO skip block
    return;
  }
  if(command==ord('\'')){
    command=readInstruction(ip++);
    if(command&0xC0n){
      //TODO read sequence of characters corresponding to utf-8 char
    }
    itrLang_pushValue([command]);//push char as string
    return;
  }
  if(command>=ord('0')&&command<=ord('9')){
    if(numberMode){
      let v=popValue();
      itrLang_pushValue(10n*v+command-ord('0'));
    }else{
      itrLang_pushValue(command-ord('0'));
      numberMode=true;
    }
    return;
  }
  numberMode=false;
  switch(command){
    case ord('0'):case ord('1'):case ord('2'):case ord('3'):case ord('4'):
    case ord('5'):case ord('6'):case ord('7'):case ord('8'):case ord('9')://digits have already been handled
    case ord(' '):case ord('\t'):case ord('\n'):case ord('\r')://ignore spaces
      break;
    //strings&comments
    case ord('"'):
      stackStack.push(valueStack);
      valueStack=[];
      stringMode=true;
      break;
    case ord('\\'):
      if(readInstruction(ip)==ord('\\')){// \\ -> comment
        ip++;
        comment=true;
        return;
      }
      //TODO return
      break;
    case ord('(')://start tuple
      stackStack.push(valueStack);
      valueStack=[];
      break;
    case ord(','):{ // create new stack row
      let i=0;
      for(;i<valueStack.length&&valueStack[i].isRow;)i++;
      tail=valueStack.splice(i);
      tail.isRow=true;
      valueStack.push(tail);
      }break;
    case ord(')'):{//end tuple
      let prevStack=itrLang_popStack();
      let i=0;
      for(;i<valueStack.length&&valueStack[i].isRow;)i++;
      if(i>0){
        tail=valueStack.splice(i);
        tail.isRow=true;
        valueStack.push(tail);
        prevStack.push(new Matrix(valueStack));
      }else{
        prevStack.push(valueStack);
      }
      valueStack=prevStack;
      }break;
    // stack operations
    case ord(':'):{//dup
        let a=itrLang_peekValue();
        itrLang_pushValue(a);
      }break;
    case ord(';'):{//over
        let a=itrLang_popValue();
        let b=itrLang_peekValue();
        itrLang_pushValue(a);
        itrLang_pushValue(b);
      }break;
      //TODO swap,drop
    // arithmetic operations
    case ord('+'):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_add(a,b));
      }break;
    case ord('-'):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_subtract(a,b));
      }break;
    case ord('>'):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_compare(a,b,x=>BigInt(x>0)));
      }break;
    case ord('='):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_compare(a,b,x=>BigInt(x=0)));
      }break;
    case ord('<'):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_compare(a,b,x=>BigInt(x<0)));
      }break;
    case ord('¬'):{
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_not(a));
      }break;
    case ord('~'):{
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_negate(a));
      }break;

    default:
      running=false;
  }
  // literals
  //TODO implement itrLang
  // itr -> "Intger,Tuple,Rational" / ITeRator
  /* stack types: unbounded integer, tuple, rational, real,  gaussian rational, complex
  init stack: ( (source-code) (std-in) (main-stack) )
                                        ^
  */
}
