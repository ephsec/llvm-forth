ARCH=64
EXECUTABLE=forth-kernel
BUGPOINT=bugpoint-3.3 -run-int
LLVMOPT=opt-3.3 -Oz -S
LLVMAS=llvm-as-3.3 -regalloc=greedy
LLVMC=llc-3.3
#LLVMC=llc-3.3 -regalloc=iterativescan

all: $(EXECUTABLE).ll
	cat $(EXECUTABLE)-preamble-$(ARCH).ll $(EXECUTABLE).ll > $(EXECUTABLE)-$(ARCH).ll
	$(LLVMAS) $(EXECUTABLE)-$(ARCH).ll
	$(LLVMC) $(EXECUTABLE)-$(ARCH).bc
	clang -o $(EXECUTABLE)-$(ARCH) $(EXECUTABLE)-$(ARCH).s
	time ./$(EXECUTABLE)-$(ARCH)

optimize: $(EXECUTABLE).ll
	$(LLVMOPT) $(EXECUTABLE).ll > forth-kernel.opt.ll
	$(LLVMAS) $(EXECUTABLE).opt.ll
	$(LLVMC) $(EXECUTABLE).opt.bc
	clang -o $(EXECUTABLE).opt $(EXECUTABLE).opt.s
	time ./$(EXECUTABLE).opt

bugpoint: $(EXECUTABLE).ll
	$(LLVMOPT) $(EXECUTABLE).ll > forth.opt.ll
	$(LLVMAS) $(EXECUTABLE).opt.ll
	$(LLVMC) $(EXECUTABLE).opt.bc
	$(BUGPOINT) $(EXECUTABLE).opt.bc
	clang -o $(EXECUTABLE).opt $(EXECUTABLE).opt.s
	time ./$(EXECUTABLE).opt

clean:
	rm -f $(EXECUTABLE)
	rm -f $(EXECUTABLE).s
	rm -f $(EXECUTABLE).bc
	rm -f $(EXECUTABLE).opt.ll
	rm -f $(EXECUTABLE).opt.bc
	rm -f $(EXECUTABLE).opt.s
	rm -f $(EXECUTABLE).opt
