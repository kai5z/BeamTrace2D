Beam tracing algorithm in 2D.

Utilizing a tree structure for the beams and a BSP tree for accelerated ray tracing.

### Demo

```
npm install
npm start
```

app should be running on [http://localhost:3000](http://localhost:3000). Clicking moves the source.

The basics are very loosely based on the following paper:
.. S. Laine, S. Siltanen, T. Lokki, and L. Savioja. Accelerated beam tracing algorithm. Applied Acoustics, 70(1):172–181, 2009

Possible improvements include:
- BSP tree optimization
- For some reason, the implementation is *much* slower in Firefox than Chrome
