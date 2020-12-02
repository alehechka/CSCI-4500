#include <pthread.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>

double logn = 0;
double n;
int numThreads;
int iterations;
pthread_mutex_t lock;

void *computeLogAt(void *vargp);

int main(int argc, char** argv) {

    if(pthread_mutex_init(&lock, NULL) != 0) {
        return 1;
    }

    n = atof(argv[1]);
    numThreads = atoi(argv[2]);
    iterations = atoi(argv[3]);

    pthread_t threads[numThreads];
    for(long i = 1; i<=numThreads; i++) {
        pthread_create(&threads[i], NULL, computeLogAt, (void *)i);
        pthread_join(threads[i], NULL);
    }   

    printf("%.14f\n", logn);
    printf("%.14f\n", log(n));

    pthread_mutex_destroy(&lock);
    pthread_exit(NULL);
}

void *computeLogAt(void *vargp) {

    pthread_mutex_lock(&lock);

    for(long i = (long)vargp; i<=numThreads*iterations; i+=numThreads) {
        double temp = (pow((n-1), i) / i);
        if(i%2==0) {
            logn -= temp;
        } else {
            logn += temp;
        }
    }

    pthread_mutex_unlock(&lock);
    
    pthread_exit(NULL);
}
