if ( typeof global == 'undefined' ) {
  var asm = require('asm.js');
  var context = window;
} else {
  var context = global;
}

function forth(stdlib, foreign, heap) {
  "use asm";

  // Our heap
  var HU32 = new stdlib.Int32Array(heap);

  // globals
  var log = foreign.consoleDotLog;
  var display = foreign.Display;

  // Registers
  var eax = 0;
  var ebx = 0;
  var ecx = 0;
  var edx = 0;
  var esi = 0;
  var edi = 0;
  var ebp = 0;
  var esp = 0;
  var reg = 0;

  function LODSL() {
    eax = HU32[(esi<<2)>>2]>>>0;    // read memory into accumulator
    esi = (esi + 1)>>>0;            // increment ESI pointer
  };

  function NEXT() {
    LODSL();            // move onto our next instruction in the heap
    display(esi|0, eax|0, esp|0);
    ftable[eax]();      // execute the instruction pointed at in the heap
  };

  // Push our register passed onto the return stack.
  function PUSHRSP(reg) {
    reg = reg|0
    ebp = ebp - 1;
    HU32[ebp] = reg;
  };

  // Pop our register from the return stack.
  function POPRSP(reg) {
    reg = reg|0
    reg = HU32[ebp];
    ebp = ebp + 1;
  };

  function DOCOL() {
    PUSHRSP(esi);     // push our current ESI onto the return stack
    eax = eax + 4;    // eax points to our codeword, so we skip it and
    esi = eax;        // set esi to +32 bytes -- this means our Forth
                      // words can be up to 32 bytes long.
    NEXT();           // move onto the next codeword
  };

  // END is simply a stub function that doesn't call NEXT(), therby
  // ending execution.
  function END() {};

  // Forth words
  function POP() {
    reg = HU32[esp];
    esp = esp + 1;
    return( reg|0 );
  };

  function PUSH(reg) {
    reg = reg|0
    esp = esp - 1;
    HU32[esp] = reg;
  };

  function DROP() {
    eax = POP();
    NEXT();
  };

  function SWAP() {
    eax = POP();
    ebx = POP();
    PUSH(eax);
    PUSH(ebx);
    NEXT();
  };

  function DUP() {
    eax = HU32[esp];
    PUSH(eax);
    NEXT();
  };

  function OVER() {
    eax = HU32[esp+1];
    PUSH(eax);
    NEXT();
  };

  function ROT() {
    eax = POP();
    ebx = POP();
    ecx = POP();
    PUSH(eax);
    PUSH(ebx);
    PUSH(ecx);
    NEXT();
  };

  function MINROT() {
    eax = POP();
    ebx = POP();
    ecx = POP();
    PUSH(eax);
    PUSH(ecx);
    PUSH(ebx);
    NEXT();
  };

  function TWODROP() {
    eax = POP();
    eax = POP();
    NEXT();
  };

  function TWODUP() {
    eax = HU32[esp];
    ebx = HU32[esp+1];
    PUSH(ebx);
    PUSH(eax);
    NEXT();
  };

  function TWOSWAP() {
    eax = POP();
    ebx = POP();
    ecx = POP();
    edx = POP();
    PUSH(ebx);
    PUSH(eax);
    PUSH(edx);
    PUSH(ecx);
    NEXT();
  };

  function QDUP() {
    eax = HU32[esp];
    if ( eax != 0 ) {
      PUSH(eax);
    };
    NEXT();
  };

  function INCR() {
    HU32[esp] = HU32[esp] + 1;
    NEXT();
  };

  function DECR() {
    HU32[esp] = HU32[esp] - 1;
    NEXT();
  };

  function INCR4() {
    HU32[esp] = HU32[esp] + 4;
    NEXT();
  };

  function DECR4() {
    HU32[esp] = HU32[esp] - 4;
    NEXT();
  };

  function ADD() {
    eax = POP();
    HU32[esp] = HU32[esp] + eax;
    NEXT();
  };

  function SUB() {
    eax = POP();
    HU32[esp] = HU32[esp] - eax;
    NEXT();
  };

  function MUL() {
    eax = POP();
    ebx = POP();
    eax = ebx * eax;
    PUSH(eax);
    NEXT();
  };

  function DIV() {
    ebx = POP();
    eax = POP();
    eax = ebx / eax;
    PUSH(eax);
    NEXT();
  };

  function NIL(){
  }

  function execute(progAddr, endStackAddr) {
    progAddr = progAddr|0;
    endStackAddr = endStackAddr|0;
    esi = progAddr;
    esp = endStackAddr;
    NEXT();
  }

  // function tables
  var calltable = [ POP ];
  var rettable = [ PUSH ];
  var ftable = [ END, DROP, SWAP, DUP, OVER, ROT, MINROT, TWODROP,
           TWOSWAP, QDUP, INCR, DECR, INCR4, DECR4, ADD, SUB, MUL,
           DIV, NIL, NIL, NIL, NIL, NIL, NIL, NIL, NIL, NIL, NIL, NIL, NIL,
           NIL, NIL];

  // exports declaration
  return { execute: execute };
};

var words = [ "END", "DROP", "SWAP", "DUP", "OVER", "ROT",
        "-ROT", "2DROP", "2SWAP", "?DUP", "INCR", "DECR", "INCR4",
        "DECR4", "+", "-", "*", "/" ];

function compile(input) {
  var tokenArray = [];
  var currIndex = 0;
  var tokens = input.split(/\s/);
  while (tokens.length) {
    var token = tokens.shift();
    if ( words.indexOf( token ) ) {
      console.log( token );
      tokenArray[currIndex] = words.indexOf( token );
      currIndex = currIndex + 1;
    }
  }

  var compiledTokens = ArrayBuffer(currIndex * 4);
  var compiledAligned = Uint32Array(compiledTokens);
  for (i in tokenArray) {
    console.log(i, tokenArray[i]);
    compiledAligned[i] = tokenArray[i];
  };
  return( compiledTokens );
}

if ( typeof asm !== 'undefined' ) {
  var x = asm.validate( forth );
}

// Test functions
var ForthHeap = new ArrayBuffer(128);
var ForthHeap32 = new Uint32Array(ForthHeap);

// Set our initial stack to [3, 2, 1]
ForthHeap32[31] = 1;
ForthHeap32[30] = 2;
ForthHeap32[29] = 3;

// Get a compiled list of function references
compiled = compile("+ DUP ROT SWAP OVER + DUP *")
compiled32 = new Uint32Array(compiled);

// Inject our compiled stream into our heap.
for (i in compiled32) {
  ForthHeap32[i] = compiled32[i];
};

var instructionPointer = 0;
var endOfStackPointer = 29;

function createDisplay(heap) {
  return(
    function Display(esi, eax, esp) {
      var viewStack = [];
      var stackArray = heap.slice(esp * 4, heap.byteLength);
      var currStack = new Int32Array(stackArray);
      for (i=0; i<currStack.length; i++) {
        viewStack.push( currStack[i] );
      };
      console.log( "ESI:", esi, "NEXT:", words[eax], "ESP:", esp, 
        "STACK:", viewStack );
    }
    )};

// Instantiate our ASM.JS Forth interpreter with the given heap.
var forthInterpreter = forth(context, { consoleDotLog: console.log,
                                       Display: createDisplay( ForthHeap ) },
                                       ForthHeap);
// Start execution with the instruction pointer and the end of stack pointer.
forthInterpreter.execute(instructionPointer, endOfStackPointer);
