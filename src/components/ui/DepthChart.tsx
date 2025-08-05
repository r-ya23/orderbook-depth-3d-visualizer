// import React, { useEffect, useMemo, useRef } from "react";
// import { useSelector } from "react-redux";
// import * as THREE from "three";
// import { RootState } from "@/store";

// interface OrderbookEntry {
//   price: number;
//   quantity: number;
//   time: number;
// }

// const OrderbookDepthChart: React.FC = () => {
//     const { snapshot } = useSelector((state: RootState) => state.orderbook);
//   const mountRef = useRef<HTMLDivElement>(null);
//   const sceneRef = useRef<THREE.Scene>(null);
//   const rendererRef = useRef<THREE.WebGLRenderer>(null);
//   const cameraRef = useRef<THREE.OrthographicCamera>(null);

//   // Memoized data processing to prevent unnecessary recalculations
//     const processedData = useMemo(() => {
//       if (!snapshot) return null;

//       const bids = Array.from(snapshot.bids.values()).flat();
//       const asks = Array.from(snapshot.asks.values()).flat();

//       // Limit the number of items to prevent memory issues
//       const maxItems = 100;
//       const limitedBids = bids.slice(0, maxItems);
//       const limitedAsks = asks.slice(0, maxItems);

//       // Calculate ranges
//       const allPrices = [...limitedBids, ...limitedAsks].map(
//         (level) => level?.price || 0
//       );
//       const allQuantities = [...limitedBids, ...limitedAsks].map(
//         (level) => level?.quantity || 0
//       );

//       const calculateCumulative = (orders: any, reverse = false) => {
//         const sorted = [...orders].sort((a, b) =>
//           reverse ? b.price - a.price : a.price - b.price
//         );
//         let cumulative = 0;
//         return sorted.map((order) => {
//           cumulative += order.quantity;
//           return { ...order, cumulativeQty: cumulative };
//         });
//       };

//       const minPrice = Math.min(...allPrices);
//       const maxPrice = Math.max(...allPrices);
//       const cumulativeBids = calculateCumulative(bids, true);
//       const cumulativeAsks = calculateCumulative(asks, false);
//       const maxQty = Math.max(
//         Math.max(...cumulativeBids.map((b) => b.cumulativeQty)),
//         Math.max(...cumulativeAsks.map((a) => a.cumulativeQty))
//       );
//       const priceRange = maxPrice - minPrice || 1; // Prevent division by zero
//       const maxQuantity = Math.max(...allQuantities) || 1;

//       return {
//         bids: limitedBids,
//         asks: limitedAsks,
//         minPrice,
//         maxPrice,
//         priceRange,
//         maxQuantity,
//         cumulativeBids,
//         cumulativeAsks,
//         maxQty
//       };
//     }, [snapshot]);

//   const createDepthChart = () => {
//     if (!mountRef.current) return;

//     // Scene setup
//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x0a0e1a);
//     sceneRef.current = scene;

//     // Camera setup
//     const width = 800;
//     const height = 600;
//     const camera = new THREE.OrthographicCamera(
//       -width / 2,
//       width / 2,
//       height / 2,
//       -height / 2,
//       1,
//       1000
//     );
//     camera.position.z = 10;
//     cameraRef.current = camera;

//     // Renderer setup
//     const renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setSize(width, height);
//     rendererRef.current = renderer;
//     mountRef.current.appendChild(renderer.domElement);

//     // Generate data
//     if (!processedData) {
//       console.log("No snapshot available");
//       return null;
//     }

//     const {
//       bids,
//       asks,
//       minPrice,
//       maxPrice,
//       priceRange,
//       maxQuantity,
//       cumulativeBids,
//       cumulativeAsks,
//       maxQty,
//     } = processedData;

//     // // Calculate cumulative quantities for depth chart
//     // const calculateCumulative = (orders: OrderbookEntry[], reverse = false) => {
//     //   const sorted = [...orders].sort((a, b) =>
//     //     reverse ? b.price - a.price : a.price - b.price
//     //   );
//     //   let cumulative = 0;
//     //   return sorted.map((order) => {
//     //     cumulative += order.quantity;
//     //     return { ...order, cumulativeQty: cumulative };
//     //   });
//     // };

//     // const cumulativeBids = calculateCumulative(bids, true);
//     // const cumulativeAsks = calculateCumulative(asks, false);

//     // Chart dimensions
//     const chartWidth = 700;
//     const chartHeight = 500;
//     // const minPrice = Math.min(...bids.map((b) => b.price));
//     // const maxPrice = Math.max(...asks.map((a) => a.price));
//     // const maxQty = Math.max(
//     //   Math.max(...cumulativeBids.map((b) => b.cumulativeQty)),
//     //   Math.max(...cumulativeAsks.map((a) => a.cumulativeQty))
//     // );

//     // Helper function to convert data coordinates to screen coordinates
//     const toScreenX = (price: number) =>
//       ((price - minPrice) / (maxPrice - minPrice)) * chartWidth -
//       chartWidth / 2;
//     const toScreenY = (qty: number) =>
//       (qty / maxQty) * chartHeight - chartHeight / 2;

//     // Create grid
//     const gridGroup = new THREE.Group();

//     // Vertical grid lines
//     for (let i = 0; i <= 10; i++) {
//       const geometry = new THREE.BufferGeometry().setFromPoints([
//         new THREE.Vector3(
//           -chartWidth / 2 + (i * chartWidth) / 10,
//           -chartHeight / 2,
//           0
//         ),
//         new THREE.Vector3(
//           -chartWidth / 2 + (i * chartWidth) / 10,
//           chartHeight / 2,
//           0
//         ),
//       ]);
//       const material = new THREE.LineBasicMaterial({
//         color: 0x333333,
//         opacity: 0.3,
//         transparent: true,
//       });
//       const line = new THREE.Line(geometry, material);
//       gridGroup.add(line);
//     }

//     // Horizontal grid lines
//     for (let i = 0; i <= 10; i++) {
//       const geometry = new THREE.BufferGeometry().setFromPoints([
//         new THREE.Vector3(
//           -chartWidth / 2,
//           -chartHeight / 2 + (i * chartHeight) / 10,
//           0
//         ),
//         new THREE.Vector3(
//           chartWidth / 2,
//           -chartHeight / 2 + (i * chartHeight) / 10,
//           0
//         ),
//       ]);
//       const material = new THREE.LineBasicMaterial({
//         color: 0x333333,
//         opacity: 0.3,
//         transparent: true,
//       });
//       const line = new THREE.Line(geometry, material);
//       gridGroup.add(line);
//     }

//     scene.add(gridGroup);

//     // Create bid area (green)
//     const bidPoints = cumulativeBids.map(
//       (bid) =>
//         new THREE.Vector3(toScreenX(bid.price), toScreenY(bid.cumulativeQty), 0)
//     );

//     // Add points to complete the area
//     bidPoints.unshift(
//       new THREE.Vector3(toScreenX(cumulativeBids[0].price), toScreenY(0), 0)
//     );
//     bidPoints.push(
//       new THREE.Vector3(
//         toScreenX(cumulativeBids[cumulativeBids.length - 1].price),
//         toScreenY(0),
//         0
//       )
//     );

//     const bidGeometry = new THREE.BufferGeometry().setFromPoints(bidPoints);
//     const bidIndices = [];
//     for (let i = 1; i < bidPoints.length - 1; i++) {
//       bidIndices.push(0, i, i + 1);
//     }
//     bidGeometry.setIndex(bidIndices);

//     const bidMaterial = new THREE.MeshBasicMaterial({
//       color: 0x00ff88,
//       transparent: true,
//       opacity: 0.3,
//       side: THREE.DoubleSide,
//     });
//     const bidMesh = new THREE.Mesh(bidGeometry, bidMaterial);
//     scene.add(bidMesh);

//     // Create bid line
//     const bidLineGeometry = new THREE.BufferGeometry().setFromPoints(
//       cumulativeBids.map(
//         (bid) =>
//           new THREE.Vector3(
//             toScreenX(bid.price),
//             toScreenY(bid.cumulativeQty),
//             0
//           )
//       )
//     );
//     const bidLineMaterial = new THREE.LineBasicMaterial({
//       color: 0x00ff88,
//       linewidth: 2,
//     });
//     const bidLine = new THREE.Line(bidLineGeometry, bidLineMaterial);
//     scene.add(bidLine);

//     // Create ask area (red)
//     const askPoints = cumulativeAsks.map(
//       (ask) =>
//         new THREE.Vector3(toScreenX(ask.price), toScreenY(ask.cumulativeQty), 0)
//     );

//     // Add points to complete the area
//     askPoints.unshift(
//       new THREE.Vector3(toScreenX(cumulativeAsks[0].price), toScreenY(0), 0)
//     );
//     askPoints.push(
//       new THREE.Vector3(
//         toScreenX(cumulativeAsks[cumulativeAsks.length - 1].price),
//         toScreenY(0),
//         0
//       )
//     );

//     const askGeometry = new THREE.BufferGeometry().setFromPoints(askPoints);
//     const askIndices = [];
//     for (let i = 1; i < askPoints.length - 1; i++) {
//       askIndices.push(0, i, i + 1);
//     }
//     askGeometry.setIndex(askIndices);

//     const askMaterial = new THREE.MeshBasicMaterial({
//       color: 0xff4444,
//       transparent: true,
//       opacity: 0.3,
//       side: THREE.DoubleSide,
//     });
//     const askMesh = new THREE.Mesh(askGeometry, askMaterial);
//     scene.add(askMesh);

//     // Create ask line
//     const askLineGeometry = new THREE.BufferGeometry().setFromPoints(
//       cumulativeAsks.map(
//         (ask) =>
//           new THREE.Vector3(
//             toScreenX(ask.price),
//             toScreenY(ask.cumulativeQty),
//             0
//           )
//       )
//     );
//     const askLineMaterial = new THREE.LineBasicMaterial({
//       color: 0xff4444,
//       linewidth: 2,
//     });
//     const askLine = new THREE.Line(askLineGeometry, askLineMaterial);
//     scene.add(askLine);

//     // Add price points as small circles
//     [...cumulativeBids, ...cumulativeAsks].forEach((point) => {
//       const dotGeometry = new THREE.CircleGeometry(3, 8);
//       const dotMaterial = new THREE.MeshBasicMaterial({
//         color: point.price < 50000 ? 0x00ff88 : 0xff4444,
//       });
//       const dot = new THREE.Mesh(dotGeometry, dotMaterial);
//       dot.position.set(
//         toScreenX(point.price),
//         toScreenY(point.cumulativeQty),
//         1
//       );
//       scene.add(dot);
//     });

//     // Add chart border
//     const borderPoints = [
//       new THREE.Vector3(-chartWidth / 2, -chartHeight / 2, 0),
//       new THREE.Vector3(chartWidth / 2, -chartHeight / 2, 0),
//       new THREE.Vector3(chartWidth / 2, chartHeight / 2, 0),
//       new THREE.Vector3(-chartWidth / 2, chartHeight / 2, 0),
//       new THREE.Vector3(-chartWidth / 2, -chartHeight / 2, 0),
//     ];
//     const borderGeometry = new THREE.BufferGeometry().setFromPoints(
//       borderPoints
//     );
//     const borderMaterial = new THREE.LineBasicMaterial({ color: 0x666666 });
//     const border = new THREE.Line(borderGeometry, borderMaterial);
//     scene.add(border);

//     // Render the scene
//     renderer.render(scene, camera);
//   };

//   useEffect(() => {
//     createDepthChart();

//     return () => {
//       if (
//         rendererRef.current &&
//         mountRef.current &&
//         mountRef.current.contains(rendererRef.current.domElement)
//       ) {
//         mountRef.current.removeChild(rendererRef.current.domElement);
//       }
//       if (rendererRef.current) {
//         rendererRef.current.dispose();
//       }
//     };
//   }, []);

//   return (
//     <div className="w-full h-full bg-gray-900 p-6">
//       <div className="mb-4">
//         <h2 className="text-2xl font-bold text-white mb-2">
//           Orderbook Depth Chart
//         </h2>
//         <div className="flex gap-4 text-sm">
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 bg-green-400 rounded"></div>
//             <span className="text-green-400">Bids</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 bg-red-400 rounded"></div>
//             <span className="text-red-400">Asks</span>
//           </div>
//         </div>
//       </div>
//       <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
//         <div ref={mountRef} className="flex justify-center" />
//       </div>
//       <div className="mt-4 text-xs text-gray-400">
//         <p>X-axis: Price | Y-axis: Cumulative Quantity</p>
//         <p>Green area shows bid depth, Red area shows ask depth</p>
//         <p>
//           Each point represents: Price (
//           {Math.floor(Math.random() * 1000 + 49500)}), Quantity (
//           {(Math.random() * 10 + 1).toFixed(2)}), Time (timestamp)
//         </p>
//       </div>
//     </div>
//   );
// };

// export default OrderbookDepthChart;

import React, { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import * as THREE from "three";
import { RootState } from "@/store";

interface OrderbookEntry {
  price: number;
  quantity: number;
  time: number;
  cumulativeQty?: number;
}

const OrderbookDepthChart: React.FC = () => {
  const { snapshot } = useSelector((state: RootState) => state.orderbook);
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);

  // Memoized data processing to prevent unnecessary recalculations
  const processedData = useMemo(() => {
    if (!snapshot) return null;

    const bids = Array.from(snapshot.bids.values()).flat();
    const asks = Array.from(snapshot.asks.values()).flat();

    // Limit the number of items to prevent memory issues
    const maxItems = 100;
    const limitedBids = bids.slice(0, maxItems);
    const limitedAsks = asks.slice(0, maxItems);

    // Calculate ranges
    const allPrices = [...limitedBids, ...limitedAsks].map(
      (level) => level?.price || 0
    );
    const allQuantities = [...limitedBids, ...limitedAsks].map(
      (level) => level?.quantity || 0
    );

    const calculateCumulative = (orders: any[], reverse = false) => {
      const sorted = [...orders].sort((a, b) =>
        reverse ? b.price - a.price : a.price - b.price
      );
      let cumulative = 0;
      return sorted.map((order) => {
        cumulative += order.quantity;
        return { ...order, cumulativeQty: cumulative };
      });
    };

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const cumulativeBids = calculateCumulative(limitedBids, true);
    const cumulativeAsks = calculateCumulative(limitedAsks, false);
    const maxQty = Math.max(
      Math.max(...cumulativeBids.map((b) => b.cumulativeQty || 0)),
      Math.max(...cumulativeAsks.map((a) => a.cumulativeQty || 0))
    );
    const priceRange = maxPrice - minPrice || 1; // Prevent division by zero
    const maxQuantity = Math.max(...allQuantities) || 1;

    return {
      bids: limitedBids,
      asks: limitedAsks,
      minPrice,
      maxPrice,
      priceRange,
      maxQuantity,
      cumulativeBids,
      cumulativeAsks,
      maxQty,
    };
  }, [snapshot]);

  const createDepthChart = () => {
    if (!mountRef.current || !processedData) return;

    // Clear previous canvas
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    sceneRef.current = scene;

    // Camera setup
    const width = 800;
    const height = 600;
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      1,
      1000
    );
    camera.position.z = 10;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    const { minPrice, maxPrice, cumulativeBids, cumulativeAsks, maxQty } =
      processedData;
      console.log("processed data",processedData);

    // Chart dimensions
    const chartWidth = 700;
    const chartHeight = 500;

    // Helper function to convert data coordinates to screen coordinates
    const toScreenX = (price: number) =>
      ((price - minPrice) / (maxPrice - minPrice)) * chartWidth -
      chartWidth / 2;
    const toScreenY = (qty: number) =>
      (qty / maxQty) * chartHeight - chartHeight / 2;

    // Create grid
    const gridGroup = new THREE.Group();

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(
          -chartWidth / 2 + (i * chartWidth) / 10,
          -chartHeight / 2,
          0
        ),
        new THREE.Vector3(
          -chartWidth / 2 + (i * chartWidth) / 10,
          chartHeight / 2,
          0
        ),
      ]);
      const material = new THREE.LineBasicMaterial({
        color: 0x333333,
        opacity: 0.3,
        transparent: true,
      });
      const line = new THREE.Line(geometry, material);
      gridGroup.add(line);
    }

    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(
          -chartWidth / 2,
          -chartHeight / 2 + (i * chartHeight) / 10,
          0
        ),
        new THREE.Vector3(
          chartWidth / 2,
          -chartHeight / 2 + (i * chartHeight) / 10,
          0
        ),
      ]);
      const material = new THREE.LineBasicMaterial({
        color: 0x333333,
        opacity: 0.3,
        transparent: true,
      });
      const line = new THREE.Line(geometry, material);
      gridGroup.add(line);
    }

    scene.add(gridGroup);

    // Only create charts if we have data
    if (cumulativeBids.length > 0) {
      // Create bid area (green)
      const bidPoints = cumulativeBids.map(
        (bid) =>
          new THREE.Vector3(
            toScreenX(bid.price),
            toScreenY(bid.cumulativeQty!),
            0
          )
      );

      // Add points to complete the area
      if (bidPoints.length > 0) {
        bidPoints.unshift(
          new THREE.Vector3(toScreenX(cumulativeBids[0].price), toScreenY(0), 0)
        );
        bidPoints.push(
          new THREE.Vector3(
            toScreenX(cumulativeBids[cumulativeBids.length - 1].price),
            toScreenY(0),
            0
          )
        );

        const bidGeometry = new THREE.BufferGeometry().setFromPoints(bidPoints);
        const bidIndices = [];
        for (let i = 1; i < bidPoints.length - 1; i++) {
          bidIndices.push(0, i, i + 1);
        }
        bidGeometry.setIndex(bidIndices);

        const bidMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ff88,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
        });
        const bidMesh = new THREE.Mesh(bidGeometry, bidMaterial);
        scene.add(bidMesh);

        // Create bid line
        const bidLineGeometry = new THREE.BufferGeometry().setFromPoints(
          cumulativeBids.map(
            (bid) =>
              new THREE.Vector3(
                toScreenX(bid.price),
                toScreenY(bid.cumulativeQty!),
                0
              )
          )
        );
        const bidLineMaterial = new THREE.LineBasicMaterial({
          color: 0x00ff88,
          linewidth: 2,
        });
        const bidLine = new THREE.Line(bidLineGeometry, bidLineMaterial);
        scene.add(bidLine);
      }
    }

    if (cumulativeAsks.length > 0) {
      // Create ask area (red)
      const askPoints = cumulativeAsks.map(
        (ask) =>
          new THREE.Vector3(
            toScreenX(ask.price),
            toScreenY(ask.cumulativeQty!),
            0
          )
      );

      // Add points to complete the area
      if (askPoints.length > 0) {
        askPoints.unshift(
          new THREE.Vector3(toScreenX(cumulativeAsks[0].price), toScreenY(0), 0)
        );
        askPoints.push(
          new THREE.Vector3(
            toScreenX(cumulativeAsks[cumulativeAsks.length - 1].price),
            toScreenY(0),
            0
          )
        );

        const askGeometry = new THREE.BufferGeometry().setFromPoints(askPoints);
        const askIndices = [];
        for (let i = 1; i < askPoints.length - 1; i++) {
          askIndices.push(0, i, i + 1);
        }
        askGeometry.setIndex(askIndices);

        const askMaterial = new THREE.MeshBasicMaterial({
          color: 0xff4444,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
        });
        const askMesh = new THREE.Mesh(askGeometry, askMaterial);
        scene.add(askMesh);

        // Create ask line
        const askLineGeometry = new THREE.BufferGeometry().setFromPoints(
          cumulativeAsks.map(
            (ask) =>
              new THREE.Vector3(
                toScreenX(ask.price),
                toScreenY(ask.cumulativeQty!),
                0
              )
          )
        );
        const askLineMaterial = new THREE.LineBasicMaterial({
          color: 0xff4444,
          linewidth: 2,
        });
        const askLine = new THREE.Line(askLineGeometry, askLineMaterial);
        scene.add(askLine);
      }
    }

    // Add price points as small circles
    [...cumulativeBids, ...cumulativeAsks].forEach((point) => {
      const dotGeometry = new THREE.CircleGeometry(3, 8);
      const dotMaterial = new THREE.MeshBasicMaterial({
        color: point.price < (minPrice + maxPrice) / 2 ? 0x00ff88 : 0xff4444,
      });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.set(
        toScreenX(point.price),
        toScreenY(point.cumulativeQty!),
        1
      );
      scene.add(dot);
    });

    // Add chart border
    const borderPoints = [
      new THREE.Vector3(-chartWidth / 2, -chartHeight / 2, 0),
      new THREE.Vector3(chartWidth / 2, -chartHeight / 2, 0),
      new THREE.Vector3(chartWidth / 2, chartHeight / 2, 0),
      new THREE.Vector3(-chartWidth / 2, chartHeight / 2, 0),
      new THREE.Vector3(-chartWidth / 2, -chartHeight / 2, 0),
    ];
    const borderGeometry = new THREE.BufferGeometry().setFromPoints(
      borderPoints
    );
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0x666666 });
    const border = new THREE.Line(borderGeometry, borderMaterial);
    scene.add(border);

    // Render the scene
    renderer.render(scene, camera);
  };

  useEffect(() => {
    createDepthChart();

    return () => {
      if (
        rendererRef.current &&
        mountRef.current &&
        mountRef.current.contains(rendererRef.current.domElement)
      ) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [processedData]); // Added processedData as dependency

  if (!processedData) {
    return (
      <div className="w-full h-full bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-white">No orderbook data available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-900 p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">
          Orderbook Depth Chart
        </h2>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span className="text-green-400">
              Bids ({processedData.cumulativeBids.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-red-400">
              Asks ({processedData.cumulativeAsks.length})
            </span>
          </div>
        </div>
      </div>
      <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
        <div ref={mountRef} className="flex justify-center" />
      </div>
      <div className="mt-4 text-xs text-gray-400">
        <p>X-axis: Price | Y-axis: Cumulative Quantity</p>
        <p>Green area shows bid depth, Red area shows ask depth</p>
        <p>
          Price range: ${processedData.minPrice.toFixed(2)} - $
          {processedData.maxPrice.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default OrderbookDepthChart;