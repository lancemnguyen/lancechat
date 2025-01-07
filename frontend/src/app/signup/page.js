"use client";

import { useState, useEffect, useRef } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase'; 
import { useRouter } from 'next/navigation';
import * as THREE from 'three';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  const mountRef = useRef(null); // To mount the Three.js canvas

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/chatbots/general'); // Redirect after sign-up
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please try logging in or use a different email.');
      } else {
        setError('Error creating account. Please try again.');
      }
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignUp();
    }
  };

  // Initialize Three.js with dust particles
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create particles
    const particlesCount = 1000;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff, // White particles
      size: 0.02,      // Adjust size for visibility
    });

    // Randomized particle positions
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;  // Spread particles within a 10-unit area
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    camera.position.z = 5;

    // Animation loop
    const animate = function () {
      requestAnimationFrame(animate);

      // Animate the particles (slowly rotate them or make them drift)
      particles.rotation.y += 0.001;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      // Update camera aspect ratio and renderer size
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <main className="relative flex flex-col items-center justify-center h-screen bg-gray-100">
      {/* Three.js canvas background */}
      <div ref={mountRef} className="absolute top-0 left-0 w-full h-full"></div>

      {/* Sign Up form */}
      <div className="relative p-6 bg-gradient-to-b from-gray-800 to-blue-900 shadow-md rounded-lg z-10 w-96">
        <h2 className="text-2xl font-bold mb-4 text-white text-center">LanceChat</h2>
        <input
          type="email"
          className="border p-2 mb-4 w-full bg-gray-900 text-white placeholder-gray-500"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <input
          type="password"
          className="border p-2 mb-4 w-full bg-gray-900 text-white placeholder-gray-500"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={handleSignUp}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        >
          Sign Up
        </button>
        <p className="mt-4 text-gray-400 text-center">
          Already have an account? <a href="/" className="text-blue-500">Login</a>
        </p>
      </div>
    </main>
  );
};

export default SignUpPage;
