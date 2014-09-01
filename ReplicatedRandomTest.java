import java.util.Random;

public class ReplicatedRandomTest {
    public static void main(String args[]) {
        ReplicatedRandom rr = new ReplicatedRandom();

        if (args.length == 1) {
            // Assuming the argument is a string representing a double,
            // replicate the Random that the double was generated from
            if (rr.replicateState(Double.parseDouble(args[0]))) {
                for (int j = 0; j < 10; j++)
                    System.out.println(rr.nextDouble());
            }
            return;
        }

        System.out.println("Replicating from Math.random");
        for (int i = 0; i < 3; i++) {
            if (rr.replicateState(Math.random())) {
                for (int j = 0; j < 3; j++)
                    System.out.println(rr.nextDouble() + "\t" + Math.random());
                System.out.println();
            }
        }

        System.out.println("Replicating from nextDouble");
        for (int i = 0; i < 3; i++) {
            Random r = new Random(i);
            if (rr.replicateState(r.nextDouble())) {
                for (int j = 0; j < 3; j++)
                    System.out.println(rr.nextDouble() + "\t" + r.nextDouble());
                System.out.println();
            }
        }

        System.out.println("Replicating from nextInt");
        for (int i = 0; i < 3; i++) {
            Random r = new Random();
            if (rr.replicateState(r.nextInt(), r.nextInt())) {
                for (int j = 0; j < 3; j++)
                    System.out.println(rr.nextInt() + "\t" + r.nextInt());
                System.out.println();
            }
        }

        System.out.println("Replicating from nextLong");
        for (int i = 0; i < 3; i++) {
            Random r = new Random();
            if (rr.replicateState(r.nextLong())) {
                for (int j = 0; j < 3; j++)
                    System.out.println(rr.nextLong() + "\t" + r.nextLong());
                System.out.println();
            }
        }

/*
        for (int i = 0; i < 3; i++) {
            Random r = new Random();
            if (rr.replicateState(r.nextFloat(), r.nextFloat())) {
                for (int j = 0; j < 3; j++)
                    System.out.println(rr.nextFloat() + "\t" + r.nextFloat());
                System.out.println();
            }
        }
*/
    }
}
