%pntr = type i32*
%cell = type i32
%cell.ptr = type i32*
%ret = type i32
%ret.ptr = type i32*
%exec = type i32
%exec.ptr = type i32*
%int = type i32
%addr = type i32
%addr.ptr = type i32*
%fnaddr = type i8*

; below needs to be adjusted to the machine architecture as appropriate; wrapper
; funciton is called from within the Forth code.
declare {i32, i1} @llvm.uadd.with.overflow.i32(i32 %a, i32 %b)

define {%int, i1} @llvm_ump(%int %first.value, %int %second.value) {
    %res = call {%int, i1} @llvm.uadd.with.overflow.i32(%int %first.value,
                                                        %int %second.value)
    ret {%int, i1} %res
}
