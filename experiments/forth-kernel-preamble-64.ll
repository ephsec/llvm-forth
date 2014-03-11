%pntr = type i64*
%cell = type i64
%cell.ptr = type i64*
%ret = type i64
%ret.ptr = type i64*
%exec = type i64
%exec.ptr = type i64*
%int = type i64
%addr = type i64
%addr.ptr = type i64*
%fnaddr = type i8*

; below needs to be adjusted to the machine architecture as appropriate; wrapper
; funciton is called from within the Forth code.
declare {i64, i1} @llvm.uadd.with.overflow.i64(i64 %a, i64 %b)

define {%int, i1} @llvm_ump(%int %first.value, %int %second.value) {
    %res = call {%int, i1} @llvm.uadd.with.overflow.i64(%int %first.value,
                                                        %int %second.value)
    ret {%int, i1} %res
}
