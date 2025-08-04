import React from "react";
import { Html } from "@react-three/drei";

const CSS3DAxes = ({ axisLength = 10 }) => {
  const ticks = [2, 4, 6, 8, 10];
  return (
    <group>
      <axesHelper args={[axisLength]} />

      {/* Grid helpers */}
      {/* <gridHelper args={[axisLength, 10]} />
      <gridHelper args={[axisLength, 10]} rotation-x={Math.PI / 2} />
      <gridHelper args={[axisLength, 10]} rotation-z={Math.PI / 2} /> */}

      {/* CSS3D HTML elements - rendered as 3D but using HTML/CSS */}
      <Html position={[axisLength + 1, 0, 0]} center>
        <div
          style={{
            color: "red",
            fontSize: "16px",
            fontWeight: "bold",
            fontFamily: "monospace",
            backgroundColor: "rgba(0,0,0,0.8)",
            padding: "4px 8px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
          }}
        >
          Price (X)
        </div>
      </Html>

      <Html position={[0, axisLength + 1, 0]} center>
        <div
          style={{
            color: "green",
            fontSize: "16px",
            fontWeight: "bold",
            fontFamily: "monospace",
            backgroundColor: "rgba(0,0,0,0.8)",
            padding: "4px 8px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
          }}
        >
          Quantity (Y)
        </div>
      </Html>

      <Html position={[0, 0, axisLength + 1]} center>
        <div
          style={{
            color: "blue",
            fontSize: "16px",
            fontWeight: "bold",
            fontFamily: "monospace",
            backgroundColor: "rgba(0,0,0,0.8)",
            padding: "4px 8px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
          }}
        >
          Time (Z)
        </div>
      </Html>

      {/* Ticks */}
      {ticks.map((t) => (
        <React.Fragment key={`tick-${t}`}>
          {/* X-axis ticks */}
          <Html position={[t, -0.2, 0]} center>
            <div style={{ color: "red", fontSize: "12px" }}>{t}</div>
          </Html>
          {/* Y-axis ticks */}
          <Html position={[-0.2, t, 0]} center>
            <div style={{ color: "green", fontSize: "12px" }}>{t}</div>
          </Html>
          {/* Z-axis ticks */}
          <Html position={[0, -0.2, t]} center>
            <div style={{ color: "blue", fontSize: "12px" }}>{t}</div>
          </Html>
        </React.Fragment>
      ))}
    </group>
  );
};

export default CSS3DAxes;
