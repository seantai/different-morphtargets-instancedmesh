import { Bvh, CameraControls, OrthographicCamera, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import React, { useMemo, useRef } from 'react'
import { Color, Matrix4 } from 'three'
// import { Perf } from 'r3f-perf'

const Scene = () => {
  //just position/color stuff
  const instanceCount = 100
  const INSTANCE_COUNT = Math.pow(Math.ceil(Math.sqrt(instanceCount)), 2)
  const instanceData = useMemo(() => {
    const matrices = new Float32Array(INSTANCE_COUNT * 16)
    const colors = new Float32Array(INSTANCE_COUNT * 3)

    const gridSize = Math.sqrt(INSTANCE_COUNT)
    const spacing = 2

    const dummyMatrix = new Matrix4()
    const dummyColor = new Color()

    for (let i = 0; i < INSTANCE_COUNT; i++) {
      const x = (i % gridSize) * spacing - (gridSize * spacing) / 2
      const y = Math.floor(i / gridSize) * spacing - (gridSize * spacing) / 2
      const z = 0

      dummyMatrix.makeTranslation(x, y, z)
      matrices.set(dummyMatrix.elements, i * 16)

      dummyColor.set(`hsl(${Math.random() * 200}, 10%, 50%)`)
      colors.set([dummyColor.r, dummyColor.g, dummyColor.b], i * 3)
    }
    return { matrices, colors }
  }, [])

  const SuzanneMorphed = useGLTF('./0328_SuzanneMorphed.glb')
  const geoMorphed = SuzanneMorphed.nodes.Suzanne.geometry

  const morphRef = useRef()

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime()
    if (morphRef.current) {
      for (let i = 0; i < INSTANCE_COUNT; i++) {
        let isEven = i % 2 === 0
        let influence1 = isEven ? Math.sin(elapsed * 2) : 0
        let influence2 = !isEven ? Math.sin(elapsed * 2) : 0

        //here is where it happens
        morphRef.current.setMorphAt(i, {
          morphTargetInfluences: [influence1, influence2]
        })
        morphRef.current.morphTexture.needsUpdate = true
      }
    }
  })

  return (
    <>
      <instancedMesh
        ref={morphRef}
        args={[geoMorphed, null, INSTANCE_COUNT]}
        morphTargetDictionary={SuzanneMorphed.nodes.Suzanne.morphTargetDictionary}
        morphTargetInfluences={SuzanneMorphed.nodes.Suzanne.morphTargetInfluences}>
        <instancedBufferAttribute attach="instanceMatrix" array={instanceData.matrices} itemSize={16} />
        <instancedBufferAttribute attach="instanceColor" array={instanceData.colors} itemSize={3} />
        <meshMatcapMaterial />
      </instancedMesh>

      <ambientLight args={[null, 2]} />
      <CameraControls />
      <OrthographicCamera makeDefault position={[100, 60, 100]} zoom={90} />
    </>
  )
}

export default function App() {
  const parent = useRef()

  return (
    <div className="w-full h-full relative cursor-pointer" ref={parent}>
      <Canvas shadows camera={{ position: [0, 2, 3] }} eventSource={parent.current}>
        <Bvh firstHitOnly>
          <Scene />
        </Bvh>
        {/* <Perf /> */}
      </Canvas>
    </div>
  )
}
