'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type VespaModelProps = {
  color: string
  autoRotate?: boolean
  onLoad?: () => void
}

export function VespaModel({ color, autoRotate = false, onLoad }: VespaModelProps) {
  const group = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/vespa_primavera_sprint.glb') // Using 1K for better performance
  
  // Load tire texture
  const tireNormal = useTexture('/textures/rubber_tires_normal.png')
  
  // Store materials for smooth color transitions
  const bodyMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([])
  const targetColorRef = useRef(new THREE.Color(color))
  
  // Clone the scene once and memoize it
  const clonedScene = useMemo(() => {
    const cloned = scene.clone()
    return cloned
  }, [scene])

  // Track if onLoad has been called
  const hasCalledOnLoad = useRef(false)

  // Auto-rotate animation + smooth color transitions + handle onLoad
  useFrame((state, delta) => {
    // Call onLoad on first frame to ensure Canvas is ready
    if (!hasCalledOnLoad.current && onLoad && clonedScene) {
      hasCalledOnLoad.current = true
      onLoad()
    }

    if (autoRotate && group.current) {
      group.current.rotation.y += delta * 0.3
    }
    
    // Smoothly transition body colors
    bodyMaterialsRef.current.forEach((material) => {
      if (material.color) {
        material.color.lerp(targetColorRef.current, delta * 6) // Smooth color transition
      }
    })
  })

  // Update target color when prop changes
  useEffect(() => {
    targetColorRef.current.set(color)
  }, [color])

  // Setup materials, textures, and shadows (runs once)
  useEffect(() => {
    if (!clonedScene) return

    const bodyMaterials: THREE.MeshStandardMaterial[] = []

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mesh = child as THREE.Mesh
        const meshName = mesh.name.toLowerCase()
        const materialName = mesh.material ? 
          (Array.isArray(mesh.material) ? mesh.material[0]?.name : mesh.material.name)?.toLowerCase() || '' 
          : ''
        
        // Check if this is a tire/wheel component (should NOT be colored)
        const isTire = 
          meshName.includes('tire') || 
          meshName.includes('wheel') || 
          meshName.includes('rubber') ||
          materialName.includes('tire') ||
          materialName.includes('wheel') ||
          materialName.includes('rubber')
        
        // Check if this is a seat/chair component (should NOT be colored)
        const isSeat = 
          meshName.includes('seat') || 
          meshName.includes('chair') || 
          meshName.includes('saddle') ||
          meshName.includes('cushion') ||
          materialName.includes('seat') ||
          materialName.includes('chair') ||
          materialName.includes('saddle') ||
          materialName.includes('leather')
        
        // Check if this is under-seat storage (should be metallic)
        const isUnderSeat = 
          meshName.includes('storage') || 
          meshName.includes('compartment') ||
          meshName.includes('underseat') ||
          meshName.includes('under_seat') ||
          meshName.includes('under') ||
          meshName.includes('box') ||
          meshName.includes('glove') ||
          meshName.includes('trunk') ||
          materialName.includes('storage') ||
          materialName.includes('compartment') ||
          materialName.includes('under') ||
          materialName.includes('box') ||
          materialName.includes('trunk')
        
        // Check if this is a headlight (should be red)
        const isHeadlight = 
          meshName.includes('headlight') || 
          meshName.includes('light') || 
          meshName.includes('lamp') ||
          meshName.includes('front_light') ||
          materialName.includes('headlight') ||
          materialName.includes('light') ||
          materialName.includes('lamp')
        
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial || 
                  mat instanceof THREE.MeshPhysicalMaterial) {
                
                const matName = mat.name.toLowerCase()
                const isTireMat = matName.includes('tire') || matName.includes('wheel') || matName.includes('rubber')
                const isSeatMat = matName.includes('seat') || matName.includes('chair') || matName.includes('saddle') || matName.includes('leather')
                const isUnderSeatMat = matName.includes('storage') || matName.includes('compartment') || matName.includes('underseat') || matName.includes('under_') || matName.includes('box') || matName.includes('trunk')
                const isHeadlightMat = matName.includes('headlight') || matName.includes('light') || matName.includes('lamp')
                
                if (isTireMat) {
                  // Apply tire texture
                  mat.normalMap = tireNormal
                  mat.color = new THREE.Color('#1a1a1a')
                  mat.roughness = 0.9
                  mat.metalness = 0
                } else if (isSeatMat) {
                  // Keep seat original color/material
                  // Don't add to bodyMaterials, don't change color
                } else if (isUnderSeatMat || isUnderSeat) {
                  // Make under-seat storage metallic silver
                  mat.color = new THREE.Color('#a8a8a8')
                  mat.metalness = 0.9
                  mat.roughness = 0.2
                  mat.envMapIntensity = 1.5
                } else if (isHeadlightMat || isHeadlight) {
                  // Make headlights dark red with glow
                  mat.color = new THREE.Color('#340900')
                  mat.emissive = new THREE.Color('#340900')
                  mat.emissiveIntensity = 1
                  mat.metalness = 0.1
                  mat.roughness = 0.3
                } else if (!isSeatMat && !isUnderSeatMat && !isHeadlightMat && 
                           (matName.includes('paint') || 
                            matName.includes('body') ||
                            matName.includes('color'))) {
                  // Store body materials for smooth color transitions
                  // Explicitly exclude seat, under-seat, and headlight materials
                  bodyMaterials.push(mat)
                  mat.color = new THREE.Color(color)
                }
              }
            })
          } else {
            const material = mesh.material
            
            if (material instanceof THREE.MeshStandardMaterial || 
                material instanceof THREE.MeshPhysicalMaterial) {
              
              const matName = material.name.toLowerCase()
              const isTireMat = matName.includes('tire') || matName.includes('wheel') || matName.includes('rubber')
              const isSeatMat = matName.includes('seat') || matName.includes('chair') || matName.includes('saddle') || matName.includes('leather')
              const isUnderSeatMat = matName.includes('storage') || matName.includes('compartment') || matName.includes('underseat') || matName.includes('under_') || matName.includes('box') || matName.includes('trunk')
              const isHeadlightMat = matName.includes('headlight') || matName.includes('light') || matName.includes('lamp')
              
              if (isTire || isTireMat) {
                // Apply tire texture and keep dark
                material.normalMap = tireNormal
                material.color = new THREE.Color('#1a1a1a')
                material.roughness = 0.9
                material.metalness = 0
              } else if (isSeat || isSeatMat) {
                // Keep seat original color/material
                // Don't add to bodyMaterials, don't change color
              } else if (isUnderSeat || isUnderSeatMat) {
                // Make under-seat storage metallic silver
                material.color = new THREE.Color('#a8a8a8')
                material.metalness = 0.9
                material.roughness = 0.2
                material.envMapIntensity = 1.5
              } else if (isHeadlight || isHeadlightMat) {
                // Make headlights dark red with glow
                material.color = new THREE.Color('#340900')
                material.emissive = new THREE.Color('#340900')
                material.emissiveIntensity = 1
                material.metalness = 0.1
                material.roughness = 0.3
              } else {
                // Only apply color to non-metallic body parts
                // Explicitly exclude protected materials
                const isBodyPart = 
                  !isTireMat && 
                  !isSeatMat && 
                  !isUnderSeatMat && 
                  !isHeadlightMat &&
                  (matName.includes('paint') || 
                   matName.includes('body') ||
                   matName.includes('color') ||
                   (material instanceof THREE.MeshStandardMaterial && material.metalness < 0.5))
                
                if (isBodyPart) {
                  bodyMaterials.push(material)
                  material.color = new THREE.Color(color)
                }
              }
            }
          }
        }
        
        // Optimize shadows - only cast on important parts
        if (!isTire && !isSeat && !isUnderSeat && !isHeadlight && !meshName.includes('small')) {
          mesh.castShadow = true
        }
        mesh.receiveShadow = true
      }
    })

    // Store body materials for smooth transitions
    bodyMaterialsRef.current = bodyMaterials
  }, [clonedScene, tireNormal, color])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up materials
      bodyMaterialsRef.current.forEach((material) => {
        material.dispose()
      })
      bodyMaterialsRef.current = []
    }
  }, [])

  return (
    <group ref={group}>
      <primitive object={clonedScene} scale={1.5} position={[0, -0.5, 0]} />
    </group>
  )
}

// Preload assets (1K version for better stability)
useGLTF.preload('/models/vespa_primavera_sprint.glb')
useTexture.preload('/textures/rubber_tires_normal.png')

