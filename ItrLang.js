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
    if(denominator<0n){
      denominator=-denominator;
      numerator=-numerator;
    }
    if(denominator==0n){
      numerator=0n;
      denominator=1n;
    }
    let g=gcd(numerator,denominator);
    if(g!=0n){
      numerator/=g;
      denominator/=g;
    }
    this.numerator=numerator;
    this.denominator=denominator;
  }
  toString(){
    if(this.denominator==1n)
      return `${this.numerator}`
    return `${this.numerator}/${this.denominator}`;
  }
}
class Matrix{
  constructor(rows){
    this.rows=rows;
    this.nrows=rows.length;
    this.ncolumns=Math.max(...rows.map(r=>r.length));
  }
  at(row,column){
    if(row<0||row>=this.nrows)
      return 0n;
    if(column<0||column>=this.rows[row].length)
      return 0n;
    return this.rows[row][column];
  }
  toString(){//TODO print values correctly
    let s="("
    this.rows.forEach(r=>{r.forEach(e=>{s+=e+" ";});s=(r.length>0?s.substring(0,s.length-1):s)+",";});
    return s.substring(0,s.length-1)+")";
  }
  copy(){
    let newRows=new Array(this.nrows);
    for(let r=0;r<this.nrows;r++){
      newRows[r]=[...this.rows[r]];
    }
    return new Matrix(newRows);
  }
}
//XXX? custom float type
//TODO complex type

function itrLang_transposed(A){
  let newRows=new Array(A.ncolumns);
  for(let c=0;c<A.ncolumns;c++){
    newRows[c]=new Array(A.nrows);
    for(let r=0;r<A.nrows;r++){
      newRows[c][r]=A.at(r,c);
    }
  }
  return new Matrix(newRows);
}
// adds l*A[r] onto A[k], applies the same operation to B (if existent)
function itrLang_addRow(r,k,l,A,B=undefined){
  while(k>=A.nrows){
    A.rows.push([]);
    A.nrows++;
  }
  if(B!==undefined){
    while(k>=B.nrows){
      B.rows.push([]);
      B.nrows++;
    }
  }
  for(let c=0;c<A.ncolumns;c++){
    if(A.rows[k].length<=c){
      A.rows[k].push(0n);
      A.ncolumns=Math.max(A.ncolumns,A.rows[k].length);
    }
    A.rows[k][c]=itrLang_add(A.rows[k][c],itrLang_multiply(l,A.at(r,c)));
    if(B!==undefined){
      if(B.rows[k].length<=c){
        B.rows[k].push(0n);
        B.ncolumns=Math.max(B.ncolumns,B.rows[k].length);
      }
      B.rows[k][c]=itrLang_add(B.rows[k][c],itrLang_multiply(l,B.at(r,c)));
    }
  }
}
// bring A in triangle form, apply same operations to B
function itrLang_gaussElim(A,B=undefined,complete){
  for(let r=0;r<A.nrows;r++){
    if(itrLang_compareNumbers(A.at(r,r),0n)==0){
      //find nonzero row, add it onto row r
      for(let k=r+1;k<A.nrows;k++){
        if(itrLang_compareNumbers(A.at(k,r),0n)!=0){
          itrLang_addRow(k,r,1n,A,B);
          break;
        }
      }
    }
    for(let k=r+1;k<A.nrows;k++){
      if(itrLang_compareNumbers(A.at(k,r),0n)!=0){
        itrLang_addRow(r,k,itrLang_negate(itrLang_realDivide(A.at(k,r),A.at(r,r))),A,B);//subtract scaled row from row
      }
    }
  }
  if(complete){
    for(let r=A.nrows-1;r>=0;r--){
      if(itrLang_compareNumbers(A.at(r,r),0n)==0)
        continue;
      for(let k=0;k<r;k++){
        if(itrLang_compareNumbers(A.at(k,r),0n)!=0){
          itrLang_addRow(r,k,itrLang_negate(itrLang_realDivide(A.at(k,r),A.at(r,r))),A,B);//subtract scaled row from row
        }
      }
    }
  }
}

function itrLang_determinat(A){
  A=A.copy();
  itrLang_gaussElim(A);
  let det=1n;
  for(let r=0;r<Math.max(A.nrows,A.ncolumns);r++){
    det=itrLang_multiply(det,A.at(r,r));
  }
  return det;
}
function itrLang_idMatrix(s){
  let rows=new Array(s);
  for(let i=0;i<s;i++){
    rows[i]=new Array(s);
    rows[i].fill(0n);
    rows[i][i]=1n;
  }
  return new Matrix(rows);
}
function itrLang_minv(A){
  A=A.copy();
  B=itrLang_idMatrix(Math.max(A.nrows,A.ncolumns));
  itrLang_gaussElim(A,B,true);
  for(let r=0;r<B.nrows;r++){
    let f=itrLang_invert(A.at(r,r));
    B.rows[r]=B.rows[r].map(e=>itrLang_multiply(f,e));
  }
  return B;
}
function itrLang_mldiv(A,B){
  A=A.copy();
  B=B.copy();
  itrLang_gaussElim(A,B,true);
  for(let r=0;r<B.nrows;r++){
    let f=itrLang_invert(A.at(r,r));
    B.rows[r]=B.rows[r].map(e=>itrLang_multiply(f,e));
  }
  return B;
}
function itrLang_mrdiv(A,B){// A=X*B -> A^T=B^T*X^T
  A=itrLang_transposed(A);
  B=itrLang_transposed(B);
  return itrLang_transposed(itrLang_mldiv(B,A));
}
//TODO diagonalize

function itrLang_exp(a){
  if(a instanceof Array){
    let res=[];
    a.forEach(e=>res.push(itrLang_exp(e)));
    return res;
  }
  if(!itrLang_numberOrMatrix(a))
    throw `unsupported type for exponential function: ${a.constructor.name}`;
  let res=1.0,q=a,p=q;
  let s=Math.max(a.nrows,a.ncolumns);
  if(a instanceof Matrix){
    res=itrLang_idMatrix(s);
  }
  for(let k=2;k<100;k++){//XXX? exit condition depending on norm of matrix
    res=itrLang_add(res,p);
    p=itrLang_multiply(p,q);
    p=itrLang_realDivide(p,k);
  }
  return res;
}
//TODO mlog,mpow

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
  itrLang_pushValue(itrLang_parseString(buff));
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
    itrLang_pushValue(itrLang_parseString(buff));
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
  itrLang_pushValue(itrLang_parseString(buff));
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
function itrLang_numberOrMatrix(e){
  if(itrLang_isnumber(e))
    return true;
  return e instanceof Matrix;
}

function itrLang_asArray(x){
  if(x instanceof Array)
    return x;
  return [x];
}

function create_numberRange(n){//create proxy that makes number look like 1 based-range as Array
  return {val:n,length:Number(itrLang_asInt(n)),at: function(index){
      if(index==="length")
        return ;
      index=Number(index);
      if(index<0||itrLang_compareNumbers(index,this.val)>=0||index!=Math.floor(index))
        return 0n;
      return BigInt(index)+1n;
    }
  };
}
function itrLang_toArray(x,numberToRange=true){
  if(x instanceof Array)
    return x;
  if(numberToRange&&itrLang_isnumber(x)){
    return create_numberRange(x);
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
  if(itrLang_numberOrMatrix(a)){
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
    let columns=Math.max(a.ncolumns,b.ncolumns);
    let res=new Array(rows);
    for(let i=0;i<rows;i++){
      res[i]=new Array(columns);
      for(let j=0;j<columns;j++)res[i][j]=f(a.at(i,j),b.at(i,j));
    }
    return new Matrix(res);
  }
  if(a instanceof Matrix){
    let res=new Array(a.nrows);
    for(let i=0;i<a.nrows;i++){
      res[i]=new Array(a.ncolumns);
      for(let j=0;j<a.ncolumns;j++)res[i][j]=f(a.at(i,j),b);
    }
    return new Matrix(res);
  }
  if(b instanceof Matrix){
    let res=new Array(b.nrows);
    for(let i=0;i<b.nrows;i++){
      res[i]=new Array(b.ncolumns);
      for(let j=0;j<b.ncolumns;j++)res[i][j]=f(a,b.at(i,j));
    }
    return new Matrix(res);
  }
  throw `unsupported types for matrix operation: ${a.constructor.name} and ${b.constructor.name}`;
}

function itrLang_unaryNumberOp(a,f){
  if(itrLang_isnumber(a)){
    return f(a);
  }
  if(itrLang_numberOrMatrix(a)){
    let res=new Array(a.nrows);
    for(let i=0;i<a.nrows;i++){
      res[i]=new Array(a.ncolumns);
      for(let j=0;j<a.ncolumns;j++)res[i][j]=f(a.at(i,j));
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
  if(itrLang_numberOrMatrix(a)&&itrLang_numberOrMatrix(b)){
    return pointwiseMatrixOp(a,b,(x,y)=>itrLang_binaryNumberOp(x,y,f));
  }
  if(a instanceof Array||b instanceof Array){
    let arrayA=itrLang_asArray(a),arrayB=itrLang_asArray(b),res=new Array(Math.max(arrayA.length,arrayB.length));
    for(let i=0;i<arrayA.length&&i<arrayB.length;i++)
      res[i]=itrLang_binaryNumberOp(arrayA[i],arrayB[i],f);
    for(let i=arrayB.length;i<arrayA.length;i++)
      res[i]=itrLang_binaryNumberOp(arrayA[i],itrLang_numberOrMatrix(b)?b:0n,f);
    for(let i=arrayA.length;i<arrayB.length;i++)
      res[i]=itrLang_binaryNumberOp(itrLang_numberOrMatrix(a)?a:0n,arrayB[i],f);
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
function itrLang_invert(a){
  if(itrLang_isint(a))
     return new Fraction(1n,a);
  if(itrLang_isrational(a))
     return new Fraction(a.denominator,a.numerator);
  if(itrLang_isreal(a))
    return a==0?0:1/a;
  if(a instanceof Matrix)
    return itrLang_minv(a);
  if(a instanceof Array)
    return a.map(e=>itrLang_invert(e));
  throw `unsupported type for invert: ${a.constructor.name}`;
}
function itrLang_realDivide(a,b){
  numberDivide=(x,y)=>{
    if(x==0||y==0)// set 0/0 to 0
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
    if(x==0||y==0)// set 0/0 to 0
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
    if(x==0||y==0)// set a%0 to a
      return x;
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
      res[r]=new Array(b.ncolumns);
      res[r].fill(0n);
      for(let k=0;k<a.ncolumns||k<b.nrows;k++){
        for(let c=0;c<b.ncolumns;c++){
          res[r][c]=itrLang_add(res[r][c],itrLang_multiply(a.at(r,k),b.at(k,c)));
        }
      }
    }
    return new Matrix(res);
  }
  if(itrLang_numberOrMatrix(a)&&itrLang_numberOrMatrix(b)){
    return pointwiseMatrixOp(a,b,(x,y)=>itrLang_multiply(x,y));
  }
  if(a instanceof Array||b instanceof Array){
    let arrayA=itrLang_asArray(a),arrayB=itrLang_asArray(b),res=new Array(Math.max(arrayA.length,arrayB.length));
    for(let i=0;i<arrayA.length&&i<arrayB.length;i++)
      res[i]=itrLang_multiply(arrayA[i],arrayB[i]);
    for(let i=arrayB.length;i<arrayA.length;i++)
      res[i]=itrLang_multiply(arrayA[i],itrLang_numberOrMatrix(b)?b:0n);
    for(let i=arrayA.length;i<arrayB.length;i++)
      res[i]=itrLang_multiply(itrLang_numberOrMatrix(a)?a:0n,arrayB[i]);
    return res;
  }
  throw `incompatible types for multiplication: ${a.constructor.name} and ${b.constructor.name}`;
}
function itrLang_divide(a,b,ldiv){
  if(itrLang_isnumber(a)||itrLang_isnumber(b)){
    return ldiv?itrLang_realDivide(b,a):itrLang_realDivide(a,b);
  }
  if(a instanceof Matrix&&b instanceof Matrix){
    if(ldiv){
      return itrLang_mldiv(a,b);
    }
    return itrLang_mrdiv(a,b);
  }
  if(a instanceof Array||b instanceof Array){
    let arrayA=itrLang_asArray(a),arrayB=itrLang_asArray(b),res=new Array(Math.max(arrayA.length,arrayB.length));
    for(let i=0;i<arrayA.length&&i<arrayB.length;i++)
      res[i]=itrLang_divide(arrayA[i],arrayB[i],ldiv);
    for(let i=arrayB.length;i<arrayA.length;i++)
      res[i]=itrLang_divide(arrayA[i],itrLang_numberOrMatrix(b)?b:0n,ldiv);
    for(let i=arrayA.length;i<arrayB.length;i++)
      res[i]=itrLang_divide(itrLang_numberOrMatrix(a)?a:0n,arrayB[i],ldiv);
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
  if(itrLang_numberOrMatrix(a)&&itrLang_isint(b)){
    if(b<0n){
      return itrLang_invert(itrLang_pow(a,-b));
    }
    let res=1n,p=a;
    if(a instanceof Matrix){
      res=itrLang_idMatrix(Math.max(a.nrows,a.ncolumns));
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
      res[i]=itrLang_pow(arrayA[i],itrLang_numberOrMatrix(b)?b:1n);
    for(let i=arrayA.length;i<arrayB.length;i++)
      res[i]=itrLang_pow(itrLang_numberOrMatrix(a)?a:0n,arrayB[i]);
    return res;
  }
  throw `incompatible types for exponentiation: ${a.constructor.name} and ${b.constructor.name}`;
}

//characters whose meaning cannot be overwritten
const overwriteBlacklist=[ord(';'),ord(' '),ord('\n'),ord('»'),ord('«'),ord('"'),ord('\''),ord('('),ord(','),ord(')'),ord('©'),ord('?'),ord('!'),ord('['),ord(']')];
let overwrites=new Map([]);
class ItrLang_OpOverwrite{
  constructor(op,value,autoCall){
    this.op=op;
    this.value=value;
    this.isAutoCall=autoCall;
    this.overwrites=new Map(overwrites);
  }
}
function itrLang_overwriteOp(op,value,autoCall){
  if(autoCall){
    value=itrLang_toArray(value,false);
    value=itrLang_decodeUTF8(value.map(c=>Number(c)));//get string code-points
  }
  let o=new ItrLang_OpOverwrite(op,value,autoCall);
  overwrites.set(op,o);
}

const ITR_OP_NONE=0;
const ITR_OP_MAP=1;
const ITR_OP_REDUCE=2;
const ITR_OP_FLAT_MAP=3;
const ITR_OP_ZIP=4;//zip operation
const ITR_OP_CAUCHY=5;//Cauchy-product
const ITR_OP_TIMES=6;//go through all elements of Cartesian product
const ITR_OP_SUBSET=7;//go through all elements of power set

//list of all iterator operations
const iteratorOps=[ord('µ'),ord('R'),ord('M'),ord('×'),ord('Y'),ord('C'),ord('¶')];
//list of all operators that are allowed as an isolated argument to a iterator operation
const singleByteIteratorArgs=[
  ord(' '),ord('£'),ord('¥'),
  ord('+'),ord('-'),ord('·'),ord('÷'),ord(':'),ord('%'),ord('d'),ord('&'),ord('|'),ord('x'),ord('>'),ord('='),ord('<'),
  ord('¬'),ord('s'),ord('a'),ord('¿'),ord('~'),ord('¯'),
  ord('e'),ord('*'),ord('/'),ord('\\'),ord('^'),
  ord('¡'),ord('°'),ord('L'),ord('º'),ord('¹'),ord('S'),ord('P'),ord('Í'),ord('Ì'),ord('®')
];

function readItrArgs(ip,argString){
  let op=readInstruction(ip++);
  while(iteratorOps.indexOf(op)!=-1){
    argString.push(op);
    op=readInstruction(ip++);
  }
  if(overwrites.has(op)){
    let o=overwrites.get(op);
    if(o.isAutoCall){
      argString.push(op);
      return ip;
    }
  }else if(singleByteIteratorArgs.indexOf(op)!=-1){
    argString.push(op);
    if(op==ord('L')){//pop argument when mapping with length
      argString.push(ord('à'));
      argString.push(ord('å'));
    }
    return ip;
  }
  if(op==ord('"')){
    op=readInstruction(ip++);
    while(op!=ord('\0')&&op!=ord('"')){
      argString.push(op);
      if(op==ord('\\')){
        op=readInstruction(ip++);
        argString.push(op);
      }
      op=readInstruction(ip++);
    }
    return ip;
  }
  let explicitString=false;
  if(op==ord('»')){
    op=readInstruction(ip++);
    explicitString=true;
  }
  let nestingLevel=1;
  let inString=false;
  while(op!=ord('\0')&&(nestingLevel>1||inString||(op!=ord('«')&&(explicitString||op!=ord(';'))))){// « (and ; if argument is implicit string) terminates map argument
    argString.push(op);
    if(inString){
      if(op==ord('"'))
        inString=false;
      if(op==ord('\\')){
        op=readInstruction(ip++);
        argString.push(op);
        op=readInstruction(ip++);
        continue;
      }
    }
    if(op==ord('\'')){
      op=readInstruction(ip++);
      argString.push(op);
      op=readInstruction(ip++);
      continue;
    }
    if(op==ord('"'))
      inString=true;
    if(op==ord('»'))
      nestingLevel++;
    if(op==ord('«'))
      nestingLevel--;
    op=readInstruction(ip++);
  }
  return ip-(op==ord(';')?1n:0n);
}

class ItrLang_Iterator{
  constructor(){}
  prepareNext(){}
}
class ForEachItr extends ItrLang_Iterator{
  constructor(vector,opType=ITR_OP_MAP){
    super();
    this.vector=vector;
    this.unwraped=(opType==ITR_OP_REDUCE||opType==ITR_OP_FLAT_MAP);
    this.index=0;
  }
  hasNext(){
    return this.index<this.vector.length;
  }
  pushNext(){
    itrLang_pushValue(this.vector.at(this.index++));
  }
  onEnd(){
    if(this.unwraped)
      return;
    let oldStack=itrLang_popStack();
    oldStack.push(valueStack);
    valueStack=oldStack;
  }
}
class ZipItr extends ItrLang_Iterator{
  constructor(left,right){
    super();
    this.left=left;
    this.right=right;
    this.index=0;
  }
  hasNext(){
    return this.index<this.left.length||this.index<this.right.length;
  }
  pushNext(){
    itrLang_pushValue(this.index<this.left.length?this.left.at(this.index):0n);
    itrLang_pushValue(this.index<this.right.length?this.right.at(this.index):0n);
    this.index++;
  }
  onEnd(){
    // do nothing
  }
}
class CauchyItr extends ItrLang_Iterator{
  constructor(left,right,wrapLevels=true){
    super();
    this.left=left;
    this.right=right;
    this.wrapLevels=wrapLevels;
    this.sum=0;
    this.leftIndex=0;
    if(this.left.length==0||this.right.length==0)
      this.sum=this.left.length+this.right.length;//prevent looping
  }
  prepareNext(){
    if(this.leftIndex>this.sum||this.leftIndex>=this.left.length){
      this.sum++;
      this.leftIndex=Math.max(0,this.sum-this.right.length+1);
      if(this.wrapLevels){
        let slots=itrLang_popStack();
        slots.push(valueStack);
        stackStack.push(slots);
        valueStack=[];
      }
    }
  }
  hasNext(){
    return this.sum<this.left.length+this.right.length-1;
  }
  pushNext(){
    itrLang_pushValue(this.left.at(this.leftIndex));
    itrLang_pushValue(this.right.at(this.sum-this.leftIndex));
    this.leftIndex++;
  }
  onEnd(){
    if(this.wrapLevels&&valueStack.length>0){ //TODO check if this code is reachable
      console.log("unreachable?");
      let slots=itrLang_popStack();
      slots.push(valueStack);
      stackStack.push(slots);
    }
    if(this.wrapLevels)
      valueStack=itrLang_popStack();
    let oldStack=itrLang_popStack();
    oldStack.push(valueStack);
    valueStack=oldStack;
  }
}
class SubsetItr extends ItrLang_Iterator{
  constructor(vector){
    super();
    this.vector=vector;
    this.index=0n;
    this.maxIndex=2n**BigInt(vector.length);
  }
  hasNext(){
    return this.index<this.maxIndex;
  }
  pushNext(){
    let b=1n,i=0;
    let subset=[];
    while(b<this.maxIndex){
      if(b&this.index){
        subset.push(this.vector.at(i));
      }
      i++;
      b<<=1n;
    }
    itrLang_pushValue(subset);
    this.index++;
  }
  onEnd(){
    let oldStack=itrLang_popStack();
    oldStack.push(valueStack);
    valueStack=oldStack;
  }
}
function itrLang_applyItrOp(itrOp,code){
  if(itrOp==ITR_OP_NONE)
    return;
  if(itrOp==ITR_OP_MAP||itrOp==ITR_OP_REDUCE||itrOp==ITR_OP_FLAT_MAP){
    let vector=itrLang_toArray(itrLang_popValue());
    let iterator=new ForEachItr(vector,itrOp);
    if(!iterator.hasNext()){
      if(itrOp==ITR_OP_MAP)
        itrLang_pushValue([]);
      return;
    }
    if(itrOp==ITR_OP_REDUCE){
      iterator.pushNext();
      if(!iterator.hasNext()){
        return;
      }
      iterator.pushNext();
    }else if(itrOp==ITR_OP_FLAT_MAP){
      iterator.pushNext();
    }else{
      stackStack.push(valueStack);
      valueStack=[];
      iterator.pushNext();
    }
    callStackPush(ip);
    callStackPush(sourceCode);
    callStackPush(iterator);
    sourceCode=code;
    ip=0n;
    return;
  }
  if(itrOp==ITR_OP_ZIP){
    let right=itrLang_toArray(itrLang_popValue());
    let left=itrLang_toArray(itrLang_popValue());
    let iterator=new ZipItr(left,right);
    if(!iterator.hasNext()){
      itrLang_pushValue([]);
      return;
    }
    stackStack.push(valueStack);
    valueStack=[];
    iterator.pushNext();
    callStackPush(ip);
    callStackPush(sourceCode);
    callStackPush(iterator);
    sourceCode=code;
    ip=0n;
    return;
  }
  if(itrOp==ITR_OP_CAUCHY){
    let right=itrLang_toArray(itrLang_popValue());
    let left=itrLang_toArray(itrLang_popValue());
    let iterator=new CauchyItr(left,right,true);
    if(!iterator.hasNext()){
      itrLang_pushValue([]);
      return;
    }
    stackStack.push(valueStack);
    stackStack.push([]);
    valueStack=[];
    iterator.pushNext();
    callStackPush(ip);
    callStackPush(sourceCode);
    callStackPush(iterator);
    sourceCode=code;
    ip=0n;
    return;
  }
  if(itrOp==ITR_OP_TIMES){//XXX? iterate Cartesian product row by row instead of diagonally
    let right=itrLang_toArray(itrLang_popValue());
    let left=itrLang_toArray(itrLang_popValue());
    let iterator=new CauchyItr(left,right,false);
    if(!iterator.hasNext()){
      itrLang_pushValue([]);
      return;
    }
    stackStack.push(valueStack);
    valueStack=[];
    iterator.pushNext();
    callStackPush(ip);
    callStackPush(sourceCode);
    callStackPush(iterator);
    sourceCode=code;
    ip=0n;
    return;
  }
  if(itrOp==ITR_OP_SUBSET){
    let vector=itrLang_toArray(itrLang_popValue());
    let iterator=new SubsetItr(vector);
    stackStack.push(valueStack);
    valueStack=[];
    iterator.pushNext();
    callStackPush(ip);
    callStackPush(sourceCode);
    callStackPush(iterator);
    sourceCode=code;
    ip=0n;
    return;
  }
  throw Error(`unknown itr-operation ${itrOp}`);
}

function itrLang_finishedSubroutine(){
  numberMode=false;
  if(!callStackEmpty() && callStackPeek() instanceof ItrLang_Iterator){
    let iterator=callStackPeek();
    iterator.prepareNext();
    if(iterator.hasNext()){
      iterator.pushNext();
      ip=0n;
      return;
    }
    callStackPop();
    sourceCode=callStackPop();
    ip=callStackPop();
    iterator.onEnd();
    return;
  }
  if(!callStackEmpty() && callStackPeek() instanceof Map){
    overwrites=callStackPop();
    sourceCode=callStackPop();
    ip=callStackPop();
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

function itrLang_readCodepoint(bytes,offset,out){//extended UTF8 decoder
  let b=offset<bytes.length?bytes[offset++]:0;
  let cpBytes=[b];
  if((b&0xC0)==0xC0){//read number of bytes given by leading byte
    let n=1+((b&0xE0)==0xE0)+((b&0xF0)==0xF0)+((b&0xF8)==0xF8)+((b&0xFC)==0xFC)+((b&0xFE)==0xFE)+(b==0xFF);// length of remaining UTF-8 sequence
    for(;n>0;n--){
      b=offset<bytes.length?bytes[offset]:0x80;
      cpBytes.push(b);
      offset++;
    }
  }
  if(cpBytes.length==1){
    out.push(BigInt(cpBytes[0]));
  }else{
    let cp=0n;
    // use two high bits of bytes in sequence to store high bits of number, if the byte sequence is correct UTF-8, the high bits will be zero
    cpBytes.slice(1).forEach(b=>{cp<<=2n;cp|=BigInt((b>>6)^0x2)});
    // mask out ones at start of high byte
    cp|=BigInt(cpBytes[0]&(0xff>>(cpBytes.length)));
    // append remaining bits, according to UTF-8 rules
    cpBytes.slice(1).forEach(b=>{cp<<=6n;cp|=BigInt(b&0x3f)});
    out.push(cp);
  }
  return offset;
}
function itrLang_decodeUTF8(bytes){
  let offset=0;
  let codepoints=[];
  while(offset<bytes.length){
    offset=itrLang_readCodepoint(bytes,offset,codepoints);
  }
  return codepoints;
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
        sourceCode.push(BigInt(b));//closing "
        stringMode=false;
        string=[];
        continue;
      }else if(b==ord('\\')){
        sourceCode.push(BigInt(b));
        b=bytes[++i];
      }
      i=itrLang_readCodepoint(bytes,i,sourceCode);
      i--;//do not increment counter
      continue;
    }
    if(b==ord(';')){//skip comment
      while(i<bytes.length&&bytes[i]!=ord('\n'))
        i++;
      continue;
    }
    if(b==ord('\'')){
      sourceCode.push(BigInt(b));
      i=itrLang_readCodepoint(bytes,++i,sourceCode);
      i--;//do not increment counter
      continue;
    }else if(b==ord('"')){
      stringMode=true;
    }
    sourceCode.push(BigInt(b));
  }
  //TODO update GUI
}
//convert itrLang code to bytes array
function itrLang_toBytes(){
  //XXX option to abuse extended Unicode set (use truncated sequences to save bytes)
  let bytes=[];
  let string="";
  let stringMode=false;
  for(let i=0;i<sourceCode.length;i++){
    let c=sourceCode[i];
    if(stringMode){
      if(c==ord('"')){
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
    if(c==ord(';')){//skip comment
      while(i<sourceCode.length&&sourceCode[i]!=ord('\n'))
        i++;
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

//TODO add implicit # if code contains no read instructions
//XXX? allow reading input multiple times/ save first ... input elements in variables
function itrLang_stepProgram(){
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
    itrLang_pushValue(char);//push char as string (converted to UTF-8)
    return;
  }
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
    str=itrLang_parseString(str);
    itrLang_pushValue(str);
    return;
  }
  if(command==ord('»')){
    let str=[];//position of "
    let level=1;
    while(ip<sourceCode.length){
      command=readInstruction(ip++);
      if(command==ord('«')){
        level--;
        if(level==0)//TODO don't exit code-string literal within string or char literal
          break;
      }else if(command==ord('»')){
        level++;
      }
      str=str.concat([...utf8Encode.encode(String.fromCodePoint(Number(command)))].map(c=>BigInt(c)));
    }
    itrLang_pushValue(str);
    return;
  }
  if(overwrites.has(command)){
    numberMode=false;
    let o=overwrites.get(command);
    if(o.isAutoCall){
      callStackPush(ip);
      callStackPush(sourceCode);
      callStackPush(overwrites);
      ip=0n;
      sourceCode=o.value;
      overwrites=o.overwrites;
      return;
    }
    itrLang_pushValue(o.value);
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
    return;
  }
  numberMode=false;
  switch(command){
    case ord('0'):case ord('1'):case ord('2'):case ord('3'):case ord('4'):
    case ord('5'):case ord('6'):case ord('7'):case ord('8'):case ord('9')://digits have already been handled
    case ord('"'):case ord('\'')://string and char-literals have already been handled
    case ord(' '):case ord('\t'):case ord('\n'):case ord('\r')://ignore spaces
      break;
    //comments
    case ord(';'):
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
      itrLang_pushValue(tail);
      }break;
    case ord(')'):{//end tuple
      let prevStack=itrLang_popStack();
      let i=0;
      for(;i<valueStack.length&&valueStack[i].isRow;)i++;
      if(i>0){
        tail=valueStack.splice(i);
        tail.isRow=true;
        itrLang_pushValue(tail);
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
      sourceCode=itrLang_toArray(itrLang_popValue(),false);
      sourceCode=itrLang_decodeUTF8(sourceCode.map(c=>Number(c)));//get string code-points
      ip=0n;
      break;
    case ord('?'):// ? start if/while statement
      throw new Error("unimplemented");
      break;
    case ord('!'):// ? else ? inverted if
      throw new Error("unimplemented");
      break;
    case ord('['):// end-if
      throw new Error("unimplemented");
      break;
    case ord(']'):// end-while
      throw new Error("unimplemented");
      break;
    case ord('$'):{// overwrite character
      let v=itrLang_popValue();
      command=readInstruction(ip);
      let autoCall=false;
      if(command==ord('©')){
        command=readInstruction(++ip);
        autoCall=true;
      }
      if(overwriteBlacklist.indexOf(command)>=0){
        return;
      }
      ip++;//consume next character
      itrLang_overwriteOp(command,v,autoCall);
      }break;
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
    // TODO value from/to  string
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
    case ord('d'):{//division and remainder
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_remainder(a,b));
        itrLang_pushValue(itrLang_intDivide(a,b));
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
    case ord('s'):{//sign
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_unaryNumberOp(a,x=>{let c=itrLang_compareNumbers(x,0n);return c>0?1n:c<0?-1n:0n;}));
      }break;
    case ord('a'):{//absolute value/determinant
        let a=itrLang_popValue();
        let f=(x)=>{
          if(x instanceof Array)
            return x.map(f);
          if(itrLang_isnumber(x))
            return itrLang_compareNumbers(x,0n)<0?itrLang_negate(x):x;
          if(x instanceof Matrix)
            return itrLang_determinat(x);
          throw Error(`unsupported operand for ${String.fromCodePoint(Number(command))}: ${x.constructor.name}`);
        };
        itrLang_pushValue(f(a));
      }break;
    case ord('¿'):{
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_unaryNumberOp(a,x=>BigInt(itrLang_compareNumbers(x,0n)!=0)));
      }break;
    case ord('~'):{
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_negate(a));
      }break;
    case ord('¯'):{
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_invert(a));
      }break;
    case ord('º'):{
        let a=itrLang_popValue();
        if(itrLang_isnumber(a)){//XXX? 2D range for complex numbers
          let r=[];
          for(let i=0n;itrLang_compareNumbers(i,a)<0;i++)
            r.push(i);
          itrLang_pushValue(r);
          break;
        }
        if(a instanceof Array){
          let r=[];
          for(let i=0;i<=a.length;i++)
            r.push(a.slice(0,i));
          itrLang_pushValue(r);
          break;
        }
        //XXX? what is the range of a matrix
        throw Error(`unsupported operand for ${String.fromCodePoint(Number(command))}: ${a.constructor.name}`);
      }break;
    case ord('¹'):{
        let a=itrLang_popValue();
        if(itrLang_isnumber(a)){
          let r=[];
          for(let i=1n;itrLang_compareNumbers(i,a)<=0;i++)
            r.push(i);
          itrLang_pushValue(r);
          break;
        }
        if(a instanceof Array){
          let r=[];
          for(let i=1;i<=a.length;i++)
            r.push(a.slice(0,i));
          itrLang_pushValue(r);
          break;
        }
        throw Error(`unsupported operand for ${String.fromCodePoint(Number(command))}: ${a.constructor.name}`);
      }break;
    case ord('L'):{//length
        let a=itrLang_peekValue();
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
    case ord('/'):{// right division A/B -> AB⁻¹
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_divide(a,b,false));
      }break;
    case ord('\\'):{// left division A\B -> A⁻¹B
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_divide(a,b,true));
      }break;
    case ord('^'):{
        let b=itrLang_popValue();
        let a=itrLang_popValue();
        itrLang_pushValue(itrLang_pow(a,b));
      }break;
    // vector operations
    case ord('¡'):{
        let a=itrLang_asArray(itrLang_popValue());
        itrLang_pushValue(a.toReversed());
      }break;
    case ord('°'):{
        let b=itrLang_asArray(itrLang_popValue());
        let a=itrLang_asArray(itrLang_popValue());
        itrLang_pushValue(a.concat(b));
      }break;
    case ord('µ'):{//map
        let l=[];
        ip=readItrArgs(ip,l);
        itrLang_applyItrOp(ITR_OP_MAP,l);
        return;//unfinished operation
      }
    case ord('R'):{//reduce
        let l=[];
        ip=readItrArgs(ip,l);
        itrLang_applyItrOp(ITR_OP_REDUCE,l);
        return;//unfinished operation
      }
    case ord('M'):{//flat-map
        let l=[];
        ip=readItrArgs(ip,l);
        itrLang_applyItrOp(ITR_OP_FLAT_MAP,l);
        return;//unfinished operation
      }
    case ord('×'):{//Cartesian product
        let l=[];
        ip=readItrArgs(ip,l);
        itrLang_applyItrOp(ITR_OP_TIMES,l);
        return;//unfinished operation
      }
    case ord('Y'):{//zip
        let l=[];
        ip=readItrArgs(ip,l);
        itrLang_applyItrOp(ITR_OP_ZIP,l);
        return;//unfinished operation
      }
    case ord('C'):{//cauchy-product
        let l=[];
        ip=readItrArgs(ip,l);
        itrLang_applyItrOp(ITR_OP_CAUCHY,l);
        return;//unfinished operation
      }
    case ord('¶'):{// power set
        let l=[];
        ip=readItrArgs(ip,l);
        itrLang_applyItrOp(ITR_OP_SUBSET,l);
        return;//unfinished operation
      }break;
    case ord('S'):{// sum
        let v=itrLang_popValue();
        if(itrLang_isnumber(v)){//skip conversion of number to array and calculate result directly
          //number is treated as if it were the 1-based range starting at that number
          //XXX? handle complex numbers
          if(itrLang_compareNumbers(v,0n)<=0){
            itrLang_pushValue(0n);
            return;
          }
          v=itrLang_asInt(v);
          itrLang_pushValue((v*(v+1n))/2n);
          return;
        }
        v=itrLang_toArray(v);
        let f=(v)=>{
          let res=0n;
          v.forEach(e=>{res=itrLang_add(res,e instanceof Array?f(e):e);});
          return res;
        }
        itrLang_pushValue(f(v));
      }break;
    case ord('P'):{// product
        let v=itrLang_popValue();
        if(itrLang_isnumber(v)){//skip conversion of number to array and calculate result directly
          //number is treated as if it were the 1-based range starting at that number
          //XXX? handle complex numbers
          let P=1n;
          for(let i=1n;itrLang_compareNumbers(i,v)<=0;i++)
            P*=i;
          itrLang_pushValue(P);
          return;
        }
        v=itrLang_toArray(v);
        let f=(v)=>{
          let res=1n;
          v.forEach(e=>{res=itrLang_multiply(res,e instanceof Array?f(e):e);});
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
        v.forEach(e=>e>=0n&&(res[e]=1n));
        itrLang_pushValue(res);
      }break;
    case ord('@'):{//replace number with corresponding element of vector
        let I=itrLang_popValue();
        let v=itrLang_popValue();
        if(itrLang_isnumber(v)){//calculate result directly if v already is a number
          let f=(e)=>{//number is treated as if it were the 1-based range starting at that number
            e=itrLang_asInt(e);
            return e>=0&&itrLang_compareNumbers(e,v)<0?(e+1n):0n;
          }
          itrLang_pushValue(itrLang_unaryNumberOp(I,f));
          return;
        }
        v=itrLang_toArray(v);
        let f=(e)=>{
          e=itrLang_asInt(e);
          return e>=0&&e<v.length?v[e]:0n;
        };
        itrLang_pushValue(itrLang_unaryNumberOp(I,f));
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
