Predicts the next value of `Math.random()` in Node v4 or Node v5 given two previous values. Also includes an application of predicting [CUIDs](https://github.com/ericelliott/cuid) after seeing 4 of them.

To run examples (takes ~20 seconds):

```bash
nvm use v4
npm install
npm run test
```

Example output:

```
Observations: [ 0.15998451528139412, 0.5883669573813677 ]

Predicted:	 0.24058070150204003
Actual:   	 0.24058070150204003
Predicted:	 0.6401993483304977
Actual:   	 0.6401993483304977
Predicted:	 0.8316858639009297
Actual:   	 0.8316858639009297
Predicted:	 0.37189461500383914
Actual:   	 0.37189461500383914
Predicted:	 0.35515204770490527
Actual:   	 0.35515204770490527
Predicted:	 0.4264500685967505
Actual:   	 0.4264500685967505
Predicted:	 0.7636274872347713
Actual:   	 0.7636274872347713
Predicted:	 0.2958797381725162
Actual:   	 0.2958797381725162

Observations:
cj1kvesn700000zwhpigckfaf
cj1kvesn700010zwhk1nxyo53
cj1kvesn700020zwh3ia8vp0k
cj1kvesn700030zwho1join4w

Predicted:	 c        00040zwhslf3ay4j
Actual:   	 cj1kvfhln00040zwhslf3ay4j
Predicted:	 c        00050zwha2jys8yi
Actual:   	 cj1kvfhln00050zwha2jys8yi
Predicted:	 c        00060zwhwyk6g5wi
Actual:   	 cj1kvfhln00060zwhwyk6g5wi
Predicted:	 c        00070zwhjet8w9sb
Actual:   	 cj1kvfhln00070zwhjet8w9sb
Predicted:	 c        00080zwhxpeu351a
Actual:   	 cj1kvfhln00080zwhxpeu351a
Predicted:	 c        00090zwhtjb5qfsr
Actual:   	 cj1kvfhln00090zwhtjb5qfsr
```


MWC1616 was introduced in V8 Engine version 3.24.40: https://github.com/nodejs/node/commit/1c7bf245dc2d520c005e01bcb56ecb3275971395

It was replaced with xorshift128+ after V8 Engine version 4.9.40: https://v8project.blogspot.com.au/2015/12/theres-mathrandom-and-then-theres.html?m=1

*The code here only works with MWC1616.* If you want to do the same for xorshift128+ you should google for 'z3 xorshift128+'.

Original code was from this [gist](https://gist.github.com/fta2012/57f2c48702ac1e6fe99b) spawned from this [discussion](https://github.com/fta2012/ReplicatedRandom/issues/2) (tl;dr; MWC1616 has two 32-bit state and gives you 16 bits of each directly. You only have to bruteforce the remaining 2^16 possibilities twice to recover the full state).
