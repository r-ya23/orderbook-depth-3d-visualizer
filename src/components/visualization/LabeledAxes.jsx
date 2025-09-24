// import React from "react";
// import { Text } from "@react-three/drei";

// const SimpleLabeledAxes = ({ axisLength = 10 }) => {
//   return (
//     <group>
//       {/* <axesHelper args={[axisLength]} />

//       <Text
//         position={[axisLength + 0.5, 0, 0]}
//         fontSize={0.8}
//         color="red"
//         anchorX="left"
//         anchorY="middle"
//       >
//         Price (X)
//       </Text>

//       <Text
//         position={[0, axisLength + 0.5, 0]}
//         fontSize={0.8}
//         color="green"
//         anchorX="center"
//         anchorY="bottom"
//       >
//         Quantity (Y)
//       </Text>

//       <Text
//         position={[0, 0, axisLength + 0.5]}
//         fontSize={0.8}
//         color="blue"
//         anchorX="center"
//         anchorY="middle"
//       >
//         Time (Z)
//       </Text>

//       {[2, 4, 6, 8, 10].map((i) => (
//         <React.Fragment key={`simple-ticks-${i}`}>
//           <Text position={[i, -0.5, 0]} fontSize={0.3} color="red">
//             {i}
//           </Text>
//           <Text position={[-0.5, i, 0]} fontSize={0.3} color="green">
//             {i}
//           </Text>
//           <Text position={[0, -0.5, i]} fontSize={0.3} color="blue">
//             {i}
//           </Text>
//         </React.Fragment>
//       ))} */}

//       {/* Basic axes helper */}
//       <axesHelper args={[axisLength]} />

//       {/* Geometric indicators instead of text */}
//       {/* X-axis (Price) - Red cube */}
//       <mesh position={[axisLength + 0.5, 0, 0]}>
//         <boxGeometry args={[0.3, 0.3, 0.3]} />
//         <meshBasicMaterial color="red" />
//       </mesh>

//       {/* Y-axis (Quantity) - Green cube */}
//       <mesh position={[0, axisLength + 0.5, 0]}>
//         <boxGeometry args={[0.3, 0.3, 0.3]} />
//         <meshBasicMaterial color="green" />
//       </mesh>

//       {/* Z-axis (Time) - Blue cube */}
//       <mesh position={[0, 0, axisLength + 0.5]}>
//         <boxGeometry args={[0.3, 0.3, 0.3]} />
//         <meshBasicMaterial color="blue" />
//       </mesh>
//     </group>
//   );
// };

// export default SimpleLabeledAxes;
import React from 'react';
import { Text } from '@react-three/drei';

function AxisLabels(){
  return (
    <>
      {/* Price Axis Label (X) */}
      <Text
        position={[0, -0.5, 5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        Price (USDT)
      </Text>

      {/* Quantity Axis Label (Y) */}
      <Text
        position={[-13, 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.5}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        Quantity (BTC)
      </Text>

      {/* Time Axis Label (Z) */}
      <Text
        position={[0, -0.5, -15]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        Time (Newest {'->'})
      </Text>
    </>
  );
};

export default AxisLabels;
