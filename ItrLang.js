function gcd(a,b){
  if(a<0n)
    a=-a;
  if(b<0n)
    b=-b;
  if(a<b){
    [a,b]=[b,a];
  }
  while(b!=0n){
    a%=b;
    [a,b]=[b,a];
  }
  return a;
}

class Fraction{
  constructor(numerator,denominator=1n){
    if(numerator instanceof Fraction){
      this.numerator=numerator.numerator;
      this.denominator=numerator.denominator;
      return;
    }
    let g=gcd(numerator,denominator);
    if(g!=0n){
      numerator/=g;
      denominator/=g;
    }
    if(denominator<0n){
      denominator=-denominator;
    }
    if(denominator==0n){
      numerator=0n;
      numerator=1n;
    }
    this.numerator=numerator;
    this.denominator=denominator;
  }
  toString(){
    return `${this.numerator}/${this.denominator}`;
  }
}
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
//TODO complex type

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
      res[i].fill(0n);
      res[i][i]=1n;
    }
    res=new Matrix(res);
  }
  for(let k=2;k<100;k++){//XXX? exit condition depending on norm of matrix
    res=itrLang_add(res,p);
    p=itrLang_multiply(p,q);
    p=itrLang_realDivide(p,k);
  }
  return res;
}

//TODO minv,mldiv,mrdiv,mlog,mpow

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
        if(!itrLang_isint(x))
          isString=false;
        if(x<9||x>0xf4)//character in printable Unicode range
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
  if(str[0]==ord('(')){//XXX parsing for nested brackets seems to be broken
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
        while(i<str.length&&!itrLang_isspace(str[i])&&str[i]!=ord(',')&&str[i]!=ord('(')&&str[i]!=ord(')'))i++;
        if(i0!=i||(str[i]!=ord(')')))
          buff.push(itrLang_parseString(str.slice(i0,i)));
      }
      if(str[i]==ord(')'))
        break;
      if(str[i]==ord(',')){
        rows.push(buff);
        buff=[];
      }
      if([ord('('),ord('['),ord('{'),ord('"')].indexOf(str[i])>=0)
        i--;//ensure opening bracket is not skipped
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
  //TODO support floats&fractions
  let isNumber=true;
  let negative=str[0]==ord('-');
  (negative?str.slice(1):str).forEach(c=>{if(!itrLang_isdigit(c))isNumber=false;});
  if(isNumber){
    let v=0n;
    (negative?str.slice(1):str).forEach(c=>{v*=10n;v+=c-ord('0');});
    return negative?-v:v;
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

function itrLang_isint(x){
  return typeof x === "bigint";
}
function itrLang_isrational(x){
  return typeof x === "bigint" || x instanceof Fraction;
}
function itrLang_isreal(x){
  return typeof x === "bigint"  || x instanceof Fraction || typeof x === "number";
}
function itrLang_isnumber(e){
  return typeof e === "bigint"  || e instanceof Fraction || typeof e === "number";//XXX complex
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
    let l=[];
    for(let i=1n;i<=x;i++)
      l.push(i);
    return l;
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
function itrLang_asInt(a){
  if(typeof a === "bigint")
    return a;
  if(typeof a === "number")
    return BigInt(Math.round(a));
  if(a instanceof Fraction)//TODO always round to nearest integer
    return a.numerator/a.denominator;
  throw `cannot convert ${a.constructor.name} to int`;
}
function itrLang_asReal(a){
  if(typeof a === "number")
    return a;
  if(typeof a === "bigint")
    return Number(a);
  if(a instanceof Fraction)
    return Number(a.numerator)/Number(a.denominator);//XXX? more precise conversion for large numbers
  throw `cannot convert ${a.constructor.name} to real`;
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
function itrLang_negate(x){
  numberNegate=(x)=>{
    if(itrLang_isint(x))
      return -x;
    if(itrLang_isrational(x)){
      x=new Fraction(x);
      return new Fraction(-x.numerator,x.denominator);
    }
    if(itrLang_isreal(x))
      return -itrLang_asReal(x);
  throw `unsupported number type for negation: ${x.constructor.name}`;
  }
  return itrLang_unaryNumberOp(x,numberNegate);
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
function itrLang_compareNumbers(x,y){
  if(itrLang_isint(x) && itrLang_isint(y))
    return x-y;
  if(itrLang_isrational(x) && itrLang_isrational(y)){
    x=new Fraction(x);y=new Fraction(y);
    return x.numerator*y.denominator-y.numerator*x.denominator;
  }
  if(itrLang_isreal(x)&& itrLang_isreal(y))
    return itrLang_asReal(x)-itrLang_asReal(y);
  throw `incompatible number types for number comparison: ${x.constructor.name} and ${y.constructor.name}`;
}
function itrLang_add(a,b){
  numberAdd=(x,y)=>{
    if(itrLang_isint(x) && itrLang_isint(y))
      return x+y;
    if(itrLang_isrational(x) && itrLang_isrational(y)){
      x=new Fraction(x);y=new Fraction(y);
      return new Fraction(x.numerator*y.denominator+y.numerator*x.denominator,x.denominator*y.denominator);
    }
    if(itrLang_isreal(x)&& itrLang_isreal(y))
      return itrLang_asReal(x)+itrLang_asReal(y);
    throw `incompatible number types for binary arithmetic operation: ${x.constructor.name} and ${y.constructor.name}`;
  }
  return itrLang_binaryNumberOp(a,b,numberAdd);
}
function itrLang_subtract(a,b){
  numberSubtract=(x,y)=>{
    if(itrLang_isint(x) && itrLang_isint(y))
      return x-y;
    if(itrLang_isrational(x) && itrLang_isrational(y)){
      x=new Fraction(x);y=new Fraction(y);
      return new Fraction(x.numerator*y.denominator-y.numerator*x.denominator,x.denominator*y.denominator);
    }
    if(itrLang_isreal(x)&& itrLang_isreal(y))
      return itrLang_asReal(x)-itrLang_asReal(y);
    throw `incompatible number types for binary arithmetic operation: ${x.constructor.name} and ${y.constructor.name}`;
  }
  return itrLang_binaryNumberOp(a,b,numberSubtract);
}
function itrLang_realDivide(a,b){
  numberDivide=(x,y)=>{
    if(a==0||b==0)// set 0/0 to 0
      return 0n;
    if(itrLang_isint(x) && itrLang_isint(y))
      return new Fraction(x,y);
    if(itrLang_isrational(x) && itrLang_isrational(y)){
      x=new Fraction(x);y=new Fraction(y);
      return new Fraction(x.numerator*y.denominator,x.denominator*y.numerator);
    }
    if(itrLang_isreal(x)&& itrLang_isreal(y))
      return itrLang_asReal(x)/itrLang_asReal(y);
    throw `incompatible number types for binary arithmetic operation: ${x.constructor.name} and ${y.constructor.name}`;
  }
  return itrLang_binaryNumberOp(a,b,numberDivide);
}
function itrLang_intDivide(a,b){
  numberDivide=(x,y)=>{
    if(a==0||b==0)// set 0/0 to 0
      return 0n;
    if(itrLang_isint(x) && itrLang_isint(y))
      return x/y;
    if(itrLang_isrational(x) && itrLang_isrational(y)){
      x=new Fraction(x);y=new Fraction(y);
      return (x.numerator*y.denominator)/(x.denominator*y.numerator);
    }
    if(itrLang_isreal(x)&& itrLang_isreal(y))
      return Math.floor(itrLang_asReal(x)/itrLang_asReal(y));
    throw `incompatible number types for binary arithmetic operation: ${x.constructor.name} and ${y.constructor.name}`;
  }
  return itrLang_binaryNumberOp(a,b,numberDivide);
}
function itrLang_remainder(a,b){
  numberRemainder=(x,y)=>{
    if(a==0||b==0)// set a%0 to a
      return a;
    if(itrLang_isint(x) && itrLang_isint(y))
      return x%y;
    if(itrLang_isrational(x) && itrLang_isrational(y)){
      x=new Fraction(x);y=new Fraction(y);
      let i=(x.numerator*y.denominator)/(x.denominator*y.numerator);
      return new Fraction(x.numerator*y.denominator-i*(x.denominator*y.numerator),x.denominator*y.denominator);
    }
    if(itrLang_isreal(x)&& itrLang_isreal(y))
      return (itrLang_asReal(x)/itrLang_asReal(y))%1;
    throw `incompatible number types for binary arithmetic operation: ${x.constructor.name} and ${y.constructor.name}`;
  }
  return itrLang_binaryNumberOp(a,b,numberRemainder);
}
function itrLang_multiply(a,b){
  if(itrLang_isnumber(a)&&itrLang_isnumber(b)){
    if(a==0||b==0)
      return 0n;
    if(itrLang_isint(a) && itrLang_isint(b))
      return a*b;
    if(itrLang_isrational(a) && itrLang_isrational(b)){
      a=new Fraction(a);b=new Fraction(b);
      return new Fraction(a.numerator*b.numerator,a.denominator*b.denominator);
    }
    if(itrLang_isreal(a)&& itrLang_isreal(b))
      return itrLang_asReal(a)*itrLang_asReal(b);
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
  if(itrLang_isint(a)&&itrLang_isint(b)){
    if(b<0n){
      return new Fraction(1n,itrLang_pow(a,-b));
    }
    return a**b;
  }
  if(itrLang_ismatrix(a)&&itrLang_isint(b)){
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

let mapBy=false;
class ForEachLoop{
  constructor(vector){
    this.vector=vector;
    this.index=1;
  }
}
function itrLang_map(code){
  let vector=itrLang_toArray(itrLang_popValue());
  if(vector.length==0){
    itrLang_pushValue(vector);
    return;
  }
  stackStack.push(valueStack);
  valueStack=[vector[0]];
  callStackPush(ip);
  callStackPush(sourceCode);
  callStackPush(new ForEachLoop(vector));
  sourceCode=code;
  ip=0;
}

function itrLang_finishedSubroutine(){
  numberMode=false;
  mapBy=false;
  if(!callStackEmpty() && callStackPeek() instanceof ForEachLoop){
    let loop=callStackPeek();
    if(loop.index<loop.vector.length){
      valueStack.push(loop.vector[loop.index++]);
      ip=0;
      return;
    }
    callStackPop();
    sourceCode=callStackPop();
    ip=callStackPop();
    let oldStack=itrLang_popStack();
    oldStack.push(valueStack);
    valueStack=oldStack;
    return;
  }
  if(!callStackEmpty() && callStackPeek() instanceof Array){
    sourceCode=callStackPop();
    ip=callStackPop();
    return;
  }
  running=false;
  if(outputEmpty()){//output top stack element
    itrLang_printValue(itrLang_peekValue(),true);
  }
}

//load ItrLang file from given byte array
function itrLang_loadFromBytes(bytes){
  if(!(bytes instanceof Uint8Array))
    throw new Error(`expected Uint8Array got ${bytes.constructor.name}`);
  let stringMode=false;
  sourceCode=[];
  let string=[];
  for(let i=0;i<bytes.length;i++){
    let b=bytes[i];
    if(stringMode){
      if(b==ord('"')){
        // TODO custom UTF-8 en/decoding allowing "illegal" code-points:
        //   0x80 - 0xbf outside sequence, characters outside unicode, sequences that are shorter than specified ...
        sourceCode=sourceCode.concat([...utf8Decode.decode(new Uint8Array(string))].map(c=>ord(c)));
        sourceCode.push(BigInt(b));//closing "
        stringMode=false;
        string=[];
        continue;
      }else if(b==ord('\\')){
        string.push(b);
        b=bytes[++i];
      }
      string.push(b);
      continue;
    }
    if(b==ord('\'')){
      sourceCode.push(BigInt(b));
      b=bytes[++i];
      sourceCode.push(BigInt(b));
      if(b&0xC0){//read number of bytes given by leading byte
        let n=1+((b&0xE0)==0xE0)+((b&0xF0)==0xF0)+((b&0xF8)==0xF8)+((b&0xFC)==0xFC)+((b&0xFE)==0xFE)+(b==0xFF);// length of remaining UTF-8 sequence
        for(;n>0;n--){
          b=bytes[i];
          if(b&0xC0!=0x80)//no longer within UTF-8 sequence
            break;
          sourceCode.push(BigInt(b));
          i++;
        }
      }
      continue;
    }else if(b==ord('"')){
      stringMode=true;
    }
    sourceCode.push(BigInt(b));
  }
}
//convert itrLang code to bytes array
function itrLang_toBytes(){
  //XXX option to abuse extended Unicode set (use malformed sequences to save bytes)
  let bytes=[];
  let string="";
  let stringMode=false;
  for(let i=0;i<sourceCode.length;i++){
    let c=sourceCode[i];
    if(stringMode){
      if(c==ord('"')){//XXX use custom Unicode encoder
        bytes=bytes.concat([...utf8Encode.encode(string)]);
        bytes.push(Number(c));//closing "
        stringMode=false;
        string="";
        continue;
      }else if(c==ord('\\')){
        string+=String.fromCodePoint(Number(c));
        c=sourceCode[++i];
      }
      string+=String.fromCodePoint(Number(c));
      continue;
    }
    if(c==ord('\'')){
      bytes.push(Number(c));
      c=sourceCode[++i];
      bytes=bytes.concat([...utf8Encode.encode(String.fromCodePoint(Number(c)))]);
      continue;
    }else if(c==ord('"')){
      stringMode=true;
    }
    bytes.push(Number(c));
  }
  return new Uint8Array(bytes);
}

function itrLang_stepProgram(){//TODO add support for code-strings »«
  command=readInstruction(ip++);
  if(ip>sourceCode.length||command==ord('\0')){
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
    let char=[...utf8Encode.encode(String.fromCodePoint(Number(command)))].map(c=>BigInt(c));
    if(mapBy){
      let v=itrLang_toArray(itrLang_popValue());
      v=v.map(x=>char);
      itrLang_pushValue(v);
      mapBy=false;
    }else{
      itrLang_pushValue(char);//push char as string (converted to UTF-8)
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
    command=readInstruction(ip);
    if(mapBy&&(command<ord('0')||command>ord('9'))){// µ followed by number
      let n=itrLang_popValue();
      let v=itrLang_toArray(itrLang_popValue());
      v=v.map(x=>n);
      itrLang_pushValue(v);
      mapBy=false;
    }
    return;
  }
  numberMode=false;
  if(command==ord('"')){
    let str=[Number(ord('"'))];//position of "
    while(ip<sourceCode.length){
      command=readInstruction(ip++);
      str=str.concat([...utf8Encode.encode(String.fromCodePoint(Number(command)))].map(c=>BigInt(c)));
      if(command==ord('"')){
        break;
      }
      if(command==ord('\\')){
        command=readInstruction(ip++);
        str=str.concat([...utf8Encode.encode(String.fromCodePoint(Number(command)))].map(c=>BigInt(c)));
      }
    }
    if(mapBy){
      itrLang_map([...utf8Decode.decode(new Uint8Array(str.slice(1,str.length-1).map(c=>Number(c))))].map(c=>ord(c)));
      mapBy=false;
      return;
    }
    itrLang_pushValue(itrLang_parseString(str));
    return;
  }
  if(command==ord('»')){
    let str=[];//position of "
    let level=1;
    while(ip<sourceCode.length){
      command=readInstruction(ip++);
      if(command==ord('«')){
        level--;
        if(level==0)
          break;
      }else if(command==ord('»')){
        level++;
      }
      str=str.concat([...utf8Encode.encode(String.fromCodePoint(Number(command)))].map(c=>BigInt(c)));
    }
    if(mapBy){
      itrLang_map([...utf8Decode.decode(new Uint8Array(str.map(c=>Number(c))))].map(c=>ord(c)));
      mapBy=false;
      return;
    }
    itrLang_pushValue(str);
    return;
  }
  if(mapBy){//XXX treat if/while blocks (  ? ... ] ? ... [  ) as blocks 
    itrLang_map([command]);
    mapBy=false;
    return;
  }
  switch(command){
    case ord('0'):case ord('1'):case ord('2'):case ord('3'):case ord('4'):
    case ord('5'):case ord('6'):case ord('7'):case ord('8'):case ord('9')://digits have already been handled
    case ord('"'):case ord('\'')://string and char-literals have already been handled
    case ord(' '):case ord('\t'):case ord('\n'):case ord('\r')://ignore spaces
      break;
    //comments
    case ord(';')://XXX? use « for comments
      while(ip++<sourceCode.length){
        if(readInstruction(ip)==ord('\n'))
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
      sourceCode=[...utf8Decode.decode(new Uint8Array(sourceCode.map(c=>Number(c))))].map(c=>ord(c));//get string code-points
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
    case ord('á'):{//over
        let a=itrLang_popValue();
        let b=itrLang_peekValue();
        itrLang_pushValue(a);
        itrLang_pushValue(b);
      }break;
    case ord('à'):{//swap
        let a=itrLang_popValue();
        let b=itrLang_popValue();
        itrLang_pushValue(a);
        itrLang_pushValue(b);
      }break;
    case ord('â'):{//"under" (shorthand for swap, over) push top element below second element
        let a=itrLang_popValue();
        let b=itrLang_popValue();
        itrLang_pushValue(a);
        itrLang_pushValue(b);
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
    case ord('§'):{// read "paragraph" (read all characters until first empty line)
        let c=getchar();
        let buff=[];
        while(c>=0){
          if(c==ord('\n')){
            c=getchar();
            if(c==ord('\n'))//double-new line
              break;
            buff.push(ord('\n'));
            continue;
          }
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
    case ord('$'):{// value to string
        itrLang_pushValue([...utf8Encode.encode(itrLang_popValue().toString())].map(c=>BigInt(c)));//XXX better to string method for arrays ? wrapper class
      }break;
    // TODO value from string
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
    case ord('·'):{//point-wise multiplication
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>x*y));
      }break;
    case ord('÷'):{// point-wise (fractional) division
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_realDivide(a,b));
      }break;
    case ord(':'):{//integer division
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_intDivide(a,b));
      }break;
    case ord('%'):{// remainder
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_remainder(a,b));
      }break;
    case ord('&'):{// bit-wise and
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>itrLang_asInt(x)&itrLang_asInt(y)));
      }break;
    case ord('|'):{//  bit-wise or
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>itrLang_asInt(x)|itrLang_asInt(y)));
      }break;
    case ord('x'):{//  bit-wise xor
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>itrLang_asInt(x)^itrLang_asInt(y)));
      }break;
    case ord('>'):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>BigInt(itrLang_compareNumbers(x,y)>0)));
      }break;
    case ord('='):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>BigInt(itrLang_compareNumbers(x,y)==0)));
      }break;
    case ord('<'):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_binaryNumberOp(a,b,(x,y)=>BigInt(itrLang_compareNumbers(x,y)<0)));
      }break;
    case ord('¬'):{
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_unaryNumberOp(a,x=>BigInt(itrLang_compareNumbers(x,0n)==0)));
      }break;
    case ord('¿'):{
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_unaryNumberOp(a,x=>BigInt(itrLang_compareNumbers(x,0n)!=0)));
      }break;
    case ord('~'):{
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_negate(a));
      }break;
    case ord('º'):{//TODO add support for different types
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
    case ord('°'):{
        let b=itrLang_asArray(itrLang_popValue());
        let a=itrLang_asArray(itrLang_popValue());
        itrLang_pushValue(a.concat(b));
      }break;
    case ord('µ'):{//map TODO handle nested µ  µµ -> use map on all sub-lists
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
        itrLang_pushValue(f(v));
      }break;
    case ord('Ì'):{//indices of nonzero elements
        let v=itrLang_asArray(itrLang_popValue());
        let res=[];
        for(let i=0n;i<v.length;i++)if(itrLang_asBool(v[i]))res.push(i);
        itrLang_pushValue(res);
      }break;
    case ord('Í'):{//put nonzero element at indices given by vector
        let v=itrLang_asArray(itrLang_popValue());
        v=v.map(x=>itrLang_asInt(x));
        let M=v.reduce((m, e) => e > m ? e : m,0n);
        let res=new Array(Number(M)+1);
        res.fill(0n);
        v.forEach(e=>res[e]=1n);
        itrLang_pushValue(res);
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
}
