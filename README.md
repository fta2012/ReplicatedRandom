Given a double generated from `nextDouble` of a `java.util.Random`, recreate a `Random` with the same state. This `ReplicatedRandom` can then be used to predict the future values of the original `Random`.

Example:

	Random r = new Random();
	ReplicatedRandom rr = new ReplicatedRandom();
	rr.replicateState(r.nextDouble());
	System.out.println(r.nextDouble() == rr.nextDouble()); // True
	System.out.println(r.nextDouble() == rr.nextDouble()); // True
	System.out.println(r.nextDouble() == rr.nextDouble()); // True

Also works with Math.random() since it uses Random internally:

	ReplicatedRandom rr = new ReplicatedRandom();
	rr.replicateState(Math.random());
	System.out.println(Math.random() == rr.nextDouble()); // True
	System.out.println(Math.random() == rr.nextDouble()); // True
	System.out.println(Math.random() == rr.nextDouble()); // True

Also works for nextInt() but requires two consecutive values:
	
	Random r = new Random();
	ReplicatedRandom rr = new ReplicatedRandom();
	rr.replicateState(r.nextInt(), r.nextInt());
	System.out.println(r.nextInt() == rr.nextInt()); // True
	System.out.println(r.nextInt() == rr.nextInt()); // True
	System.out.println(r.nextInt() == rr.nextInt()); // True

See this [blog post](http://franklinta.com/2014/08/31/predicting-the-next-math-random-in-java) for details.
