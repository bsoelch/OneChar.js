
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
  toString(){//TODO print values correctly
    let s="("
    this.rows.forEach(r=>{r.forEach(e=>{s+=e+" ";});s=(r.length>0?s.substring(0,s.length-1):s)+",";});
    return s.substring(0,s.length-1)+")";
  }
}
//XXX? custom float type
//TODO fraction type, complex type

function itrLang_exp(a){
  if(a instanceof Array){
    let res=[];
    a.forEach(e=>res.push(itrLang_exp(e)));
    return res;
  }
  if(!itrLang_ismatrix(a))
    throw `unsupported type for exponential function: ${a.constructor.name}`;
  let res=1.0,q=a,p=q;
  let s=Math.max(a.nrows,a.ncolums);
  if(a instanceof Matrix){//XXX function for creating identity matrix
    res=new Array(s);
    for(let i=0;i<s;i++){
      res[i]=new Array(s);
      res[i].fill(0.0);
      res[i][i]=1.0;
    }
    res=new Matrix(res);
  }
  for(let k=2;k<100;k++){//XXX? exit condition depending on norm of matrix
    res=itrLang_add(res,p);
    p=itrLang_multiply(p,q);
    p=itrLang_realDivide(p,k,(x,y)=>x/y);
  }
  return res;
}

//TODO minv,mldiv,mrdiv,mexp,mlog,mpow

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
function itrLang_printValue(val,detectStrings=false,escapeStrings=false){
  if(val instanceof Array){
    if(detectStrings){
      let isString=val.length>0;
      val.forEach(x=>{
        if(!itrLang_isnumber(x))
          isString=false;
        if(typeof x==="number"&&x!=Math.floor(x))
          isString=false;
        if(x<0||x>255)
          isString=false;
      });
      if(isString){
        if(escapeStrings)
          putchar(ord('"'));
        val.forEach(c=>{if(escapeStrings&&(c==ord('"')||c==ord('\\')))putchar(ord('\\'));putchar(c);});
        if(escapeStrings)
          putchar(ord('"'));
        return;
      }
    }
    let first=true;
    val.forEach((e)=>{putchar(ord(first?'(':' '));itrLang_printValue(e,detectStrings,true);first=false;});
    if(first)
      putchar(ord('('));
    putchar(ord(')'));
    return;
  }
  [...val.toString()].forEach((c)=>putchar(ord(c)));
}

function itrLang_isspace(c){
  return [ord(' '),ord('\r'),ord('\n'),ord('\t')].indexOf(c)>=0;
}
function itrLang_isdigit(c){
  return c>=ord('0')&&c<=ord('9');
}

function itrLang_findMatchingBracket(str,i,left,right){
  let k=1;
  while(i++<str.length&&k>0){
    if(str[i]==left)
      k++;
    if(str[i]==right)
      k--;
  }
  return i;
}
function itrLang_parseString(str){
  let buff=[];
  if(str[0]==ord('"')){
    for(let i=1;i<str.length;i++){//read until next "
      if(str[i]==ord('\\')){//escape sequences
        switch(str[++i]){
          case ord('t'):
            buff.push(ord('\t'));
            break;
          case ord('n'):
            buff.push(ord('\n'));
            break;
          case ord('r'):
            buff.push(ord('\r'));
            break;
          default:
            buff.push(str[i]);
        }
        continue;
      }
      if(str[i]==ord('"'))//unescaped " -> end of string
        break;
      buff.push(str[i]);
    }
    return buff;
  }
  if(str[0]==ord('[')||str[0]==ord('{')){
    let i=0;
    while(i++<str.length){
      while(itrLang_isspace(str[i]))i++;
      let i0=i;
      if(str[i]==ord('[')){
        i=itrLang_findMatchingBracket(str,i,ord('['),ord(']'));
        buff.push(itrLang_parseString(str.slice(i0,i)));
        while(i<str.length&&str[i]!=ord(',')&&str[i]!=ord(']')&&str[i]!=ord('}'))i++;
      }else if(str[i]==ord('{')){
        i=itrLang_findMatchingBracket(str,i,ord('{'),ord('}'));
        buff.push(itrLang_parseString(str.slice(i0,i)));
        while(i<str.length&&str[i]!=ord(',')&&str[i]!=ord(']')&&str[i]!=ord('}'))i++;
      }else if(str[i]==ord('(')){
        i=itrLang_findMatchingBracket(str,i,ord('('),ord(')'));
        buff.push(itrLang_parseString(str.slice(i0,i)));
        while(i<str.length&&str[i]!=ord(',')&&str[i]!=ord(']')&&str[i]!=ord('}'))i++;
      }else if(str[i]==ord('"')){
        while(i++<str.length){
          if(str[i]==ord('"'))
            break;
          if(str[i]==ord('\\'))
            i++;
        }
        buff.push(itrLang_parseString(str.slice(i0,i)));
        while(i<str.length&&str[i]!=ord(',')&&str[i]!=ord(']')&&str[i]!=ord('}'))i++;
      }else{
        while(i<str.length&&str[i]!=ord(',')&&str[i]!=ord(']')&&str[i]!=ord('}'))i++;
        if(i0!=i||(str[i]!=ord(']')&&str[i]!=ord('}')))
          buff.push(itrLang_parseString(str.slice(i0,i)));
      }
      if(str[i]==ord(']')||str[i]==ord('}'))
        break;
    }
    return buff;
  }
  if(str[0]==ord('(')){
    let rows=[];
    let i=0;
    while(i++<str.length){
      while(itrLang_isspace(str[i]))i++;
      let i0=i;
      if(str[i]==ord('[')){
        i=itrLang_findMatchingBracket(str,i,ord('['),ord(']'));
        buff.push(itrLang_parseString(str.slice(i0,i)));
      }else if(str[i]==ord('{')){
        i=itrLang_findMatchingBracket(str,i,ord('{'),ord('}'));
        buff.push(itrLang_parseString(str.slice(i0,i)));
      }else if(str[i]==ord('(')){
        i=itrLang_findMatchingBracket(str,i,ord('('),ord(')'));
        buff.push(itrLang_parseString(str.slice(i0,i)));
      }else if(str[i]==ord('"')){
        while(i++<str.length){
          if(str[i]==ord('"'))
            break;
          if(str[i]==ord('\\'))
            i++;
        }
        buff.push(itrLang_parseString(str.slice(i0,i)));
      }else{
        while(i<str.length&&!itrLang_isspace(str[i])&&str[i]!=ord(',')&&str[i]!=ord(')'))i++;
        if(i0!=i||(str[i]!=ord(')')))
          buff.push(itrLang_parseString(str.slice(i0,i)));
      }
      if(str[i]==ord(')'))
        break;
      if(str[i]==ord(',')){
        rows.push(buff);
        buff=[];
      }
    }
    if(rows.length>0){
      if(buff.length>0)
        rows.push(buff);
      return new Matrix(rows);
    }
    return buff;
  }
  //TODO trim spaces
  //XXX? support hex/binary numbers
  let isNumber=true;
  str.forEach(c=>{if(!itrLang_isdigit(c))isNumber=false;});//TODO only detect numbers if all digits are consecutive
  if(isNumber){
    let v=0n;
    str.forEach(c=>{v*=10n;v+=c-ord('0');});
    return v;
  }
  return str;
}
function itrLang_readBracket(left,right){
  let buff=[left];
  let k=1;
  let c=getchar();
  while(c>=0&&k>0){
    if(c==left)
      k++;
    if(c==right)
      k--;
    buff.push(c);
    if(k>0)
      c=getchar();
  }
  valueStack.push(itrLang_parseString(buff));
  return;
}
function itrLang_readWord(){
  let c=getchar();
  let buff=[];
  while(itrLang_isspace(c))c=getchar();//skip spaces
  if(c==ord('"')){
    buff.push(c);
    c=getchar();
    while(c>=0){
      if(c==ord('"'))
        break;
      if(c==ord('\\')){
        buff.push(c);
        c=getchar();
      }
      buff.push(c);
      c=getchar();
    }
    buff.push(c);
    valueStack.push(itrLang_parseString(buff));
    return;
  }
  if(c==ord('[')){
    itrLang_readBracket(ord('['),ord(']'));
    return;
  }
  if(c==ord('{')){
    itrLang_readBracket(ord('{'),ord('}'));
    return;
  }
  if(c==ord('(')){
    itrLang_readBracket(ord('('),ord(')'));
    return;
  }
  while(c>=0&&!itrLang_isspace(c)){//read until next space
    buff.push(c);c=getchar();
  }
  valueStack.push(itrLang_parseString(buff));
}

function itrLang_isnumber(e){
  return typeof e === "bigint" || typeof e === "number"; //XXX fraction,complex,real
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
function itrLang_toArray(x){
  if(x instanceof Array)
    return x;
  if(itrLang_isnumber(x)){
    let l=[];for(let i=1n;i<=x;i++)l.push(i);return l;
  }
  if(x instanceof Matrix){
    return x.rows;
  }
  return [x];
}
function itrLang_asBool(a){
  if(itrLang_isnumber(a)){
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

function itrLang_unaryNumberOp(a,f){
  if(itrLang_isnumber(a)){
    return f(a);
  }
  if(itrLang_ismatrix(a)){
    let res=new Array(a.nrows);
    for(let i=0;i<a.nrows;i++){
      res[i]=new Array(a.ncolums);
      for(let j=0;j<a.ncolums;j++)res[i][j]=f(a.at(i,j));
    }
    return new Matrix(res);
  }
  if(a instanceof Array){
    let res=[];
    a.forEach(e=>res.push(itrLang_unaryNumberOp(e,f)));
    return res;
  }
  throw `unsupported type for unary operation: ${a.constructor.name}`;
}
function itrLang_binaryNumberOp(a,b,f){
  if(itrLang_isnumber(a)&&itrLang_isnumber(b)){
    return f(a,b);
  }
  if(itrLang_ismatrix(a)&&itrLang_ismatrix(b)){
    return pointwiseMatrixOp(a,b,(x,y)=>itrLang_binaryNumberOp(x,y,f));
  }
  if(a instanceof Array||b instanceof Array){
    let arrayA=itrLang_asArray(a),arrayB=itrLang_asArray(b),res=new Array(Math.max(arrayA.length,arrayB.length));
    for(let i=0;i<arrayA.length&&i<arrayB.length;i++)
      res[i]=itrLang_binaryNumberOp(arrayA[i],arrayB[i],f);
    for(let i=arrayB.length;i<arrayA.length;i++)
      res[i]=itrLang_binaryNumberOp(arrayA[i],itrLang_ismatrix(b)?b:0n,f);
    for(let i=arrayA.length;i<arrayB.length;i++)
      res[i]=itrLang_binaryNumberOp(itrLang_ismatrix(a)?a:0n,arrayB[i],f);
    return res;
  }
  throw `incompatible types for binary arithmetic operation: ${a.constructor.name} and ${b.constructor.name}`;
}
function itrLang_add(a,b){
  numberAdd=(x,y)=>{
    if(typeof x === "bigint" && typeof y === "bigint" )
      return x+y;
    if((typeof x === "number"||typeof x === "bigint") && (typeof y === "number"||typeof y === "bigint"))
      return Number(x)+Number(y);
    throw `incompatible number types for binary arithmetic operation: ${x.constructor.name} and ${y.constructor.name}`;
  }
  return itrLang_binaryNumberOp(a,b,numberAdd);
}
function itrLang_realDivide(a,b){
  numberDivide=(x,y)=>{
    if(typeof x === "bigint" && typeof y === "bigint" )
      return Number(x)/Number(y);//TODO return Fraction
    if((typeof x === "number"||typeof x === "bigint") && (typeof y === "number"||typeof y === "bigint"))
      return Number(x)/Number(y);
    throw `incompatible number types for binary arithmetic operation: ${x.constructor.name} and ${y.constructor.name}`;
  }
  return itrLang_binaryNumberOp(a,b,numberDivide);
}
//XXX unary-matrix op (invert,mexp,mlog,...)
function itrLang_multiply(a,b){
  if(itrLang_isnumber(a)&&itrLang_isnumber(b)){
    if(typeof a === "bigint" && typeof b === "bigint" )
      return a*b;
    if((typeof a === "number"||typeof a === "bigint") && (typeof b === "number"||typeof b === "bigint"))
      return Number(a)*Number(b);
    throw `incompatible number types for binary arithmetic operation: ${x.constructor.name} and ${y.constructor.name}`;
  }
  if(a instanceof Matrix&&b instanceof Matrix){
    let res=new Array(a.nrows);
    for(let r=0;r<a.nrows;r++){
      res[r]=new Array(b.ncolums);
      res[r].fill(0n);
      for(let k=0;k<a.ncolums||k<b.nrows;k++){
        for(let c=0;c<b.ncolums;c++){
          res[r][c]=itrLang_add(res[r][c],itrLang_multiply(a.at(r,k),b.at(k,c)));
        }
      }
    }
    return new Matrix(res);
  }
  if(itrLang_ismatrix(a)&&itrLang_ismatrix(b)){
    return pointwiseMatrixOp(a,b,(x,y)=>itrLang_multiply(x,y));
  }
  if(a instanceof Array||b instanceof Array){
    let arrayA=itrLang_asArray(a),arrayB=itrLang_asArray(b),res=new Array(Math.max(arrayA.length,arrayB.length));
    for(let i=0;i<arrayA.length&&i<arrayB.length;i++)
      res[i]=itrLang_multiply(arrayA[i],arrayB[i]);
    for(let i=arrayB.length;i<arrayA.length;i++)
      res[i]=itrLang_multiply(arrayA[i],itrLang_ismatrix(b)?b:0n);
    for(let i=arrayA.length;i<arrayB.length;i++)
      res[i]=itrLang_multiply(itrLang_ismatrix(a)?a:0n,arrayB[i]);
    return res;
  }
  throw `incompatible types for multiplication: ${a.constructor.name} and ${b.constructor.name}`;
}
function itrLang_pow(a,b){
  if(typeof a === "bigint"&&typeof b === "bigint"){
    return a**b;
  }
  if(itrLang_ismatrix(a)&&typeof b === "bigint"){
    if(b<0n){
      return itrLang_invert(itrLang_pow(a,-b));
    }
    let res=1n,p=a;
    if(a instanceof Matrix){//XXX function for creating identity matrix
      res=new Array(a.nrows);
      for(let i=0;i<a.nrows;i++){
        res[i]=new Array(a.ncolums);
        res[i].fill(0n);
        res[i][i]=1n;
      }
      res=new Matrix(res);
    }
    while(b!=0){
      if(b&1n)
        res=itrLang_multiply(res,p);
      p=itrLang_multiply(p,p);
      b>>=1n;
    }
    return res;
  }
  if(a instanceof Array||b instanceof Array){
    let arrayA=itrLang_asArray(a),arrayB=itrLang_asArray(b),res=new Array(Math.max(arrayA.length,arrayB.length));
    for(let i=0;i<arrayA.length&&i<arrayB.length;i++)
      res[i]=itrLang_pow(arrayA[i],arrayB[i]);
    for(let i=arrayB.length;i<arrayA.length;i++)
      res[i]=itrLang_pow(arrayA[i],itrLang_ismatrix(b)?b:1n);
    for(let i=arrayA.length;i<arrayB.length;i++)
      res[i]=itrLang_pow(itrLang_ismatrix(a)?a:0n,arrayB[i]);
    return res;
  }
  throw `incompatible types for exponentiation: ${a.constructor.name} and ${b.constructor.name}`;
}

function itrLang_finishedSubroutine(){
  if(!callStackEmpty() && callStackPeek() instanceof Array){
    sourceCode=callStackPop;
    ip=callStackPop();
    return;
  }
  running=false;
  if(outputEmpty()){//output top stack element
    itrLang_printValue(itrLang_peekValue(),true);
  }
}

let mapBy=false;
function itrLang_stepProgram(){
  command=readInstruction(ip++);
  if(command==ord('\0')){
    itrLang_finishedSubroutine();
    return;//reached end of program
  }
  if(comment){
    if(command==ord('\n'))
      comment=false;
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
    if(mapBy){//replace all elements of vector with char
      let v=itrLang_popValue();
      console.log(v);
      v=v.map(x=>command);
      itrLang_pushValue(v);
      mapBy=false;
    }else{
      itrLang_pushValue([command]);//push char as string
    }
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
  if(numberMode&&mapBy){// µ followed by number
    let n=itrLang_popValue();
    let v=itrLang_popValue();
    v=v.map(x=>n);
    itrLang_pushValue(v);
    mapBy=false;
  }
  numberMode=false;
  switch(command){
    case ord('0'):case ord('1'):case ord('2'):case ord('3'):case ord('4'):
    case ord('5'):case ord('6'):case ord('7'):case ord('8'):case ord('9')://digits have already been handled
    case ord(' '):case ord('\t'):case ord('\n'):case ord('\r')://ignore spaces
      break;
    //strings&comments
    case ord('"'):
      let i0=Number(ip)-1;//position of "
      while(ip++<sourceCode.length){
        if(readInstruction(ip)==ord('"')){
          ip++;
          break;
        }
        if(readInstruction(ip)==ord('\\'))
          ip++;
      }
      itrLang_pushValue(itrLang_parseString(sourceCode.slice(i0,Number(ip))));
      if(mapBy){//TODO apply function to every element of list
        throw new Error("unimplemented");
      }
      break;
    case ord('\t'):
      while(ip++<sourceCode.length){
        if(str[ip]==ord('\n'))
          break;
      }
      return;
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
    // control flow
    case ord('©'):
      callStackPush(ip);
      callStackPush(sourceCode);
      sourceCode=itrLang_toArray(itrLang_popValue());
      ip=0;
      break;
    case ord('?'):
      // TODO start if-block
      break;
    // stack operations
    case ord('ä'):{//dup
        let a=itrLang_peekValue();
        itrLang_pushValue(a);
      }break;
    case ord('â'):{//over
        let a=itrLang_popValue();
        let b=itrLang_peekValue();
        itrLang_pushValue(a);
        itrLang_pushValue(b);
      }break;
    case ord('á'):{//swap
        let a=itrLang_popValue();
        let b=itrLang_popValue();
        itrLang_pushValue(a);
        itrLang_pushValue(b);
      }break;
    case ord('à'):{//drop under
        let a=itrLang_popValue();
        itrLang_popValue();
        itrLang_pushValue(a);
      }break;
    case ord('å'):{//drop
        let a=itrLang_popValue();
      }break;
    // IO
    case ord('_'):{// read char
        itrLang_pushValue(getchar());
      }break;
    case ord('#'):{// parse word
        itrLang_readWord();
      }break;
    // XXX read single line, read word
    case ord('§'):{// read line XXX? read lines (until first empty line)
        let c=getchar();
        let buff=[];
        while(c>=0&&c!=ord('\n')){
          buff.push(c);
          c=getchar();
        }
        itrLang_pushValue(buff);
      }break;
    case ord('¥'):{// write char(s)
        let s=itrLang_popValue();
        itrLang_unaryNumberOp(s,c=>putchar(BigInt(c)));
      }break;
    case ord('£'):{// write value
        itrLang_printValue(itrLang_popValue());
      }break;
    // TODO value from/to string
    // arithmetic operations
    case ord('+'):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_add(a,b));
      }break;
    case ord('-'):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>x-y));
      }break;
    case ord('·'):{//point-wise multiplication
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>x*y));
      }break;
      // XXX point-wise fractional division
    case ord('÷'):{//integer division
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>x/y));
      }break;
    case ord('%'):{// remainder
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>x%y));
      }break;
    case ord('&'):{// bit-wise and
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>x&y));
      }break;
    case ord('|'):{//  bit-wise or
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>x|y));
      }break;
    case ord('x'):{//  bit-wise xor
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>x^y));
      }break;
    case ord('>'):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>BigInt((x-y)>0n)));
      }break;
    case ord('='):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>BigInt((x-y)==0n)));
      }break;
    case ord('<'):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>BigInt((x-y)<0n)));
      }break;
    case ord('¬'):{
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_unaryNumberOp(a,x=>BigInt(x==0n)));
      }break;
    case ord('¿'):{
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_unaryNumberOp(a,x=>BigInt(x!=0n)));
      }break;
    case ord('~'):{
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_unaryNumberOp(a,x=>-x));
      }break;
    case ord('º'):{
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_unaryNumberOp(a,(x)=>{let l=[];for(let i=0n;i<x;i++)l.push(i);return l;}));
      }break;
    case ord('¹'):{
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_unaryNumberOp(a,(x)=>{let l=[];for(let i=1n;i<=x;i++)l.push(i);return l;}));
      }break;
    case ord('L'):{//length
        let a=itrLang_popValue();
        if(a instanceof Array)
          itrLang_pushValue(BigInt(a.length));
        else if(a instanceof Matrix)
          itrLang_pushValue(BigInt(a.nrows));
        else
          itrLang_pushValue(1n);
      }break;
    case ord('e'):{//exponential
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_exp(a));
      }break;
    // matrix operations
    case ord('*'):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_multiply(a,b));
      }break;
      // TODO matrix division  A/B -> AB⁻¹  A\B -> A⁻¹B
    case ord('^'):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_pow(a,b));
      }break;
    // vector operations
    case ord('µ'):{//map TODO handle nested µµ -> use map on all sub-lists
        mapBy=true;
        return;//unfinished operation
      }
    case ord('S'):{// sum
        let v=itrLang_toArray(itrLang_popValue());
        let f=(v)=>{
          let res=0n;
          v.forEach(e=>{res=itrLang_add(res,e instanceof Array?f(e):e);});
          return res;
        }
        if(!mapBy){
          itrLang_pushValue(f(v));
          break;
        }
        v=v.map(e=>f(itrLang_toArray(e)));
        itrLang_pushValue(v);
      }break;
    case ord('Ì'):{//indices of nonzero elements
      let v=itrLang_asArray(itrLang_popValue());
      let f=(v)=>{
        let res=[];
        for(let i=0n;i<v.length;i++)if(itrLang_asBool(v[i]))res.push(i);
        return res;
      }
      if(!mapBy){
        itrLang_pushValue(f(v));
        break;
      }
      v=v.map(e=>f(itrLang_toArray(e)));
      itrLang_pushValue(v);
      }break;
    case ord('Í'):{//put nonzero element at indices given by vector
      let v=itrLang_asArray(itrLang_popValue());
      let f=(v)=>{
        //XXX convert all elements to int
        let M=v.reduce((m, e) => e > m ? e : m,0n);
        let res=new Array(Number(M)+1);
        res.fill(0n);
        v.forEach(e=>res[e]=1n);
        return res;
      }
      if(!mapBy){
        itrLang_pushValue(f(v));
        break;
      }
      v=v.map(e=>f(itrLang_toArray(e)));
      itrLang_pushValue(v);
      }break;
    case ord('®'):{// vector to matrix
        let v=itrLang_popValue();
        if(v instanceof Array){
          let elts=[];
          v.forEach(e=>elts.push(itrLang_asArray(e)));
          itrLang_pushValue(new Matrix(elts));
          break;
        }
        if(v instanceof Matrix){
          itrLang_pushValue(v.rows);
          break;
        }
        itrLang_pushValue(v);
      }break;
    default:
      break;
  }
  mapBy=false;//operation not compatible with map
}
