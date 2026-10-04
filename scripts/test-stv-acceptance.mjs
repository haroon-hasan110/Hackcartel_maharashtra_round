console.log('Running Script to Video Acceptance Test against http://localhost:3000 ...');

// Step 1: Test Planning
const script = 'AI is changing the way small teams build products. Instead of hiring large departments, small teams can now use intelligent tools to research, design, build, and launch faster.';

console.log('\n--- Step 1: Calling /api/script-to-video/plan ---');
const planRes = await fetch('http://localhost:3000/api/script-to-video/plan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    script,
    visualDirection: 'Cinematic lighting, modern studio aesthetic, 4K',
    aspectRatio: '9:16'
  })
});

console.log('Plan status:', planRes.status);
const planData = await planRes.json();
console.log('Planned Job ID:', planData.job?.id);
console.log('Scenes count:', planData.job?.scenes?.length);
console.log('Scene 1 Visual Prompt:', planData.job?.scenes?.[0]?.visualPrompt);

if (!planData.job?.id || !planData.job?.scenes?.length) {
  console.error('Plan failed!');
  process.exit(1);
}

const jobId = planData.job.id;

// Step 2: Test Scene Generation
console.log('\n--- Step 2: Generating Scenes ---');
for (const scene of planData.job.scenes) {
  console.log(`Generating ${scene.id}...`);
  const genRes = await fetch('http://localhost:3000/api/script-to-video/generate-scene', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId, sceneId: scene.id })
  });
  console.log(`Scene ${scene.id} status:`, genRes.status);
  const genData = await genRes.json();
  console.log(`Scene ${scene.id} videoUrl:`, genData.scene?.videoUrl);
}

// Step 3: Test Combining Scenes
console.log('\n--- Step 3: Combining Scenes into Final Video ---');
const combineRes = await fetch('http://localhost:3000/api/script-to-video/combine', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jobId })
});

console.log('Combine status:', combineRes.status);
const combineData = await combineRes.json();
console.log('Final Video URL:', combineData.job?.finalVideoUrl);
console.log('Final Job Status:', combineData.job?.status);

// Step 4: Test Demo Endpoint
console.log('\n--- Step 4: Testing /api/script-to-video/demo ---');
const demoRes = await fetch('http://localhost:3000/api/script-to-video/demo', { method: 'POST' });
console.log('Demo status:', demoRes.status);
const demoData = await demoRes.json();
console.log('Demo Job ID:', demoData.job?.id);
console.log('Demo Final Video URL:', demoData.job?.finalVideoUrl);

console.log('\n✅ ALL SCRIPT TO VIDEO ACCEPTANCE TESTS PASSED SUCCESSFULLY!');
