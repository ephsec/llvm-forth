if ( typeof global !== 'undefined' ) {
  var asm = require('asm.js');
  var context = global;
} else {
  var context = window;
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
    return;
  };

  function NEXT() {
    LODSL();            // move onto our next instruction in the heap
    display(esi|0, eax|0, esp|0);
    ftable[(eax|0)]();      // execute the instruction pointed at in the heap
    return;
  };

  // Push our register passed onto the return stack.
  function PUSHRSP(reg) {
    reg = reg|0
    ebp = ebp|0 - 1;
    HU32[(ebp<<2)>>2] = reg;
    return;
  };

  // Pop our register from the return stack.
  function POPRSP(reg) {
    reg = reg|0
    reg = HU32[(ebp<<2)>>2]>>>0;
    ebp = ebp|0 + 1;
    return;
  };

  function DOCOL() {
    PUSHRSP(esi|0);     // push our current ESI onto the return stack
    eax = eax|0 + 4;    // eax points to our codeword, so we skip it and
    esi = eax;        // set esi to +32 bytes -- this means our Forth
                      // words can be up to 32 bytes long.
    NEXT();           // move onto the next codeword
    return;
  };

  // END is simply a stub function that doesn't call NEXT(), therby
  // ending execution.
  function END() {};

  // Forth words
  function POP() {
    reg = HU32[(esp<<2)>>2]>>>0;
    esp = (esp|0) + 1;
    return( reg|0 );
  };

  function PUSH(reg) {
    reg = reg|0
    esp = (esp|0) - 1;
    HU32[(esp<<2)>>2] = reg|0;
    return;
  };

  function DROP() {
    eax = POP()|0;
    NEXT();
    return;
  };

  function SWAP() {
    eax = POP()|0;
    ebx = POP()|0;
    PUSH(eax|0);
    PUSH(ebx|0);
    NEXT();
    return;
  };

  function DUP() {
    eax = HU32[(esp<<2)>>2]|0;
    PUSH(eax|0);
    NEXT();
    return;
  };

  function OVER() {
    eax = HU32[(((esp|0)+1)<<2)>>2]|0;
    PUSH(eax|0);
    NEXT();
    return;
  };

  function ROT() {
    eax = POP()|0;
    ebx = POP()|0;
    ecx = POP()|0;
    PUSH(eax|0);
    PUSH(ebx|0);
    PUSH(ecx|0);
    NEXT();
    return;
  };

  function MINROT() {
    eax = POP()|0;
    ebx = POP()|0;
    ecx = POP()|0;
    PUSH(eax|0);
    PUSH(ecx|0);
    PUSH(ebx|0);
    NEXT();
    return;
  };

  function TWODROP() {
    eax = POP()|0;
    eax = POP()|0;
    NEXT();
    return;
  };

  function TWODUP() {
    eax = HU32[(esp<<2)>>2]|0;
    ebx = HU32[(((esp|0)+1)<<2)>>2]|0;
    PUSH(ebx|0);
    PUSH(eax|0);
    NEXT();
    return;
  };

  function TWOSWAP() {
    eax = POP()|0;
    ebx = POP()|0;
    ecx = POP()|0;
    edx = POP()|0;
    PUSH(ebx|0);
    PUSH(eax|0);
    PUSH(edx|0);
    PUSH(ecx|0);
    NEXT();
    return;
  };

  function QDUP() {
    eax = HU32[(esp<<2)>>2]|0;
    if ( (eax|0) != 0 ) {
      PUSH(eax|0);
    };
    NEXT();
    return;
  };

  function INCR() {
    HU32[(esp<<2)>>2] = HU32[(esp<<2)>>2]|0 + 1;
    NEXT();
    return;
  };

  function DECR() {
    HU32[(esp<<2)>>2] = HU32[(esp<<2)>>2]|0 - 1;
    NEXT();
    return;
  };

  function INCR4() {
    HU32[(esp<<2)>>2] = HU32[(esp<<2)>>2]|0 + 4;
    NEXT();
    return;
  };

  function DECR4() {
    HU32[(esp<<2)>>2] = HU32[(esp<<2)>>2]|0 - 4;
    NEXT();
    return;
  };

  function ADD() {
    eax = POP()|0;
    HU32[(esp<<2)>>2] = (HU32[(esp<<2)>>2]|0) + eax|0;
    NEXT();
    return;
  };

  function SUB() {
    eax = POP()|0;
    HU32[(esp<<2)>>2] = (HU32[(esp<<2)>>2]|0) - eax|0;
    NEXT();
    return;
  };

  function MUL() {
    eax = POP()|0;
    ebx = POP()|0;
    eax = (ebx|0) * (eax|0);
    PUSH(eax|0);
    NEXT();
    return;
  };

  function DIV() {
    ebx = POP()|0;
    eax = POP()|0;
    eax = ((ebx>>>0) / (eax>>>0))|0;
    PUSH(eax|0);
    NEXT();
    return;
  };

  function NIL(){
  }

  function execute(progAddr, endStackAddr) {
    progAddr = progAddr|0;
    endStackAddr = endStackAddr|0;
    esi = progAddr;
    esp = endStackAddr;
    NEXT();
    return;
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
