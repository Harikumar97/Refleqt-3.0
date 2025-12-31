/**
 * Test All LLM Providers
 * Verifies connectivity and functionality of Claude, OpenAI, and Gemini
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { llm } from '../src/lib/llm';

async function testProvider(provider: 'claude' | 'openai' | 'gemini') {
  console.log(`\n>ê Testing ${provider.toUpperCase()}...`);

  try {
    const startTime = Date.now();
    const response = await llm.complete(
      'Respond with exactly: "Hello! I am working correctly."',
      provider,
      { temperature: 0.3, maxTokens: 50 }
    );
    const duration = Date.now() - startTime;

    console.log(` ${provider} SUCCESS`);
    console.log(`   Model: ${response.model}`);
    console.log(`   Response: ${response.content}`);
    console.log(`   Tokens: ${response.usage?.totalTokens || 'N/A'}`);
    console.log(`   Duration: ${duration}ms`);

    return { success: true, provider, duration, response };
  } catch (error) {
    console.log(`L ${provider} FAILED`);
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);

    return { success: false, provider, error };
  }
}

async function testMultiProvider() {
  console.log('\n=€ Testing Multi-Provider Parallel Execution...');

  try {
    const startTime = Date.now();
    const responses = await llm.multiProviderCompletion(
      'What is 2+2? Answer in one short sentence.',
      ['claude', 'openai', 'gemini'],
      { temperature: 0.1, maxTokens: 30 }
    );
    const duration = Date.now() - startTime;

    console.log(` Multi-Provider SUCCESS (${duration}ms total)`);
    responses.forEach((resp) => {
      console.log(`   ${resp.provider}: "${resp.content}"`);
    });

    return { success: true, responses, duration };
  } catch (error) {
    console.log(`L Multi-Provider FAILED`);
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, error };
  }
}

async function testSmartRouting() {
  console.log('\n<¯ Testing Smart Routing...');

  const tasks = [
    { type: 'research' as const, prompt: 'List 3 benefits of AI in healthcare' },
    { type: 'code' as const, prompt: 'Write a one-line Python function to reverse a string' },
    { type: 'creative' as const, prompt: 'Write a tagline for an AI startup' },
  ];

  for (const task of tasks) {
    try {
      const response = await llm.smartComplete(task.prompt, task.type, { maxTokens: 100 });
      console.log(` ${task.type}: ${response.provider} - "${response.content.slice(0, 50)}..."`);
    } catch (error) {
      console.log(`L ${task.type} failed: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }
}

async function main() {
  console.log('=, LLM Integration Test Suite\n');
  console.log('Testing connectivity to all AI providers...\n');
  console.log('='.repeat(60));

  const claudeResult = await testProvider('claude');
  const openaiResult = await testProvider('openai');
  const geminiResult = await testProvider('gemini');

  console.log('\n' + '='.repeat(60));
  await testMultiProvider();

  console.log('\n' + '='.repeat(60));
  await testSmartRouting();

  console.log('\n' + '='.repeat(60));
  console.log('\n=Ê Test Summary:');
  console.log(`   Claude: ${claudeResult.success ? ' Working' : 'L Failed'}`);
  console.log(`   OpenAI: ${openaiResult.success ? ' Working' : 'L Failed'}`);
  console.log(`   Gemini: ${geminiResult.success ? ' Working' : 'L Failed'}`);

  const allWorking = claudeResult.success && openaiResult.success && geminiResult.success;

  if (allWorking) {
    console.log('\n<‰ All LLM providers are working correctly!');
    console.log(' Ready to integrate into Research Swarms');
  } else {
    console.log('\n   Some providers failed. Check API keys and network connectivity.');
  }

  process.exit(allWorking ? 0 : 1);
}

main().catch((error) => {
  console.error('\n=¥ Test suite crashed:', error);
  process.exit(1);
});
