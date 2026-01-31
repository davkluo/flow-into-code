import { stripHtml } from "@/lib/formatting";
import {
  fetchLCProblemBoilerplate,
  fetchLCProblemContent,
  fetchLCProblemTestCases,
} from "@/services/leetcode/client";
import { LCProblem, ProcessedProblem } from "@/types/leetcode";

/**
 * Process a problem and save to Firestore.
 * Assumes LCProblem metadata already exists (from selection step).
 */
export async function processProblem(
  problem: LCProblem,
): Promise<ProcessedProblem> {
  const rawContent = await fetchLCProblemContent(problem.titleSlug);
  const cleanedContent = stripHtml(rawContent);

  console.log(cleanedContent);

  await fetchLCProblemTestCases(problem.titleSlug);
  await fetchLCProblemBoilerplate(problem.titleSlug);

  // Replace later with LLM calls
  const processed: ProcessedProblem = {
    ...problem,
    originalContent: cleanedContent,
    framing: {
      canonical: `Solve the ${problem.title} problem efficiently.`,
    },
    hints: [
      "Think about the core data structure needed.",
      "Consider edge cases early.",
    ],
    pitfalls: ["Off-by-one errors", "Forgetting to handle empty input"],
    solutions: ["Brute force approach", "Optimized approach using a hash map"],
    processedAt: Date.now(),
  };

  // --- Firestore write (disabled for now) ---
  // await problemRepo.upsertMany([processed]);

  return processed;
}

// Sample problem content fetched:
// Given an array of integers nums&nbsp;and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order. &nbsp; Example 1: Input: nums = [2,7,11,15], target = 9 Output: [0,1] Explanation: Because nums[0] + nums[1] == 9, we return [0, 1]. Example 2: Input: nums = [3,2,4], target = 6 Output: [1,2] Example 3: Input: nums = [3,3], target = 6 Output: [0,1] &nbsp; Constraints: 2 &lt;= nums.length &lt;= 104 -109 &lt;= nums[i] &lt;= 109 -109 &lt;= target &lt;= 109 Only one valid answer exists. &nbsp; Follow-up:&nbsp;Can you come up with an algorithm that is less than O(n2)&nbsp;time complexity?
// Test cases: [ '[2,7,11,15]\n9', '[3,2,4]\n6', '[3,3]\n6' ]
// Boilerplate code snippets: [
//   {
//     lang: 'C++',
//     langSlug: 'cpp',
//     code: 'class Solution {\n' +
//       'public:\n' +
//       '    vector<int> twoSum(vector<int>& nums, int target) {\n' +
//       '        \n' +
//       '    }\n' +
//       '};'
//   },
//   {
//     lang: 'Java',
//     langSlug: 'java',
//     code: 'class Solution {\n' +
//       '    public int[] twoSum(int[] nums, int target) {\n' +
//       '        \n' +
//       '    }\n' +
//       '}'
//   },
//   {
//     lang: 'Python3',
//     langSlug: 'python3',
//     code: 'class Solution:\n' +
//       '    def twoSum(self, nums: List[int], target: int) -> List[int]:\n' +
//       '        '
//   },
//   {
//     lang: 'Python',
//     langSlug: 'python',
//     code: 'class Solution(object):\n' +
//       '    def twoSum(self, nums, target):\n' +
//       '        """\n' +
//       '        :type nums: List[int]\n' +
//       '        :type target: int\n' +
//       '        :rtype: List[int]\n' +
//       '        """\n' +
//       '        '
//   },
//   {
//     lang: 'JavaScript',
//     langSlug: 'javascript',
//     code: '/**\n' +
//       ' * @param {number[]} nums\n' +
//       ' * @param {number} target\n' +
//       ' * @return {number[]}\n' +
//       ' */\n' +
//       'var twoSum = function(nums, target) {\n' +
//       '    \n' +
//       '};'
//   },
//   {
//     lang: 'TypeScript',
//     langSlug: 'typescript',
//     code: 'function twoSum(nums: number[], target: number): number[] {\n    \n};'
//   },
//   {
//     lang: 'C#',
//     langSlug: 'csharp',
//     code: 'public class Solution {\n' +
//       '    public int[] TwoSum(int[] nums, int target) {\n' +
//       '        \n' +
//       '    }\n' +
//       '}'
//   },
//   {
//     lang: 'C',
//     langSlug: 'c',
//     code: '/**\n' +
//       ' * Note: The returned array must be malloced, assume caller calls free().\n' +
//       ' */\n' +
//       'int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n' +
//       '    \n' +
//       '}'
//   },
//   {
//     lang: 'Go',
//     langSlug: 'golang',
//     code: 'func twoSum(nums []int, target int) []int {\n    \n}'
//   },
//   {
//     lang: 'Kotlin',
//     langSlug: 'kotlin',
//     code: 'class Solution {\n' +
//       '    fun twoSum(nums: IntArray, target: Int): IntArray {\n' +
//       '        \n' +
//       '    }\n' +
//       '}'
//   },
//   {
//     lang: 'Swift',
//     langSlug: 'swift',
//     code: 'class Solution {\n' +
//       '    func twoSum(_ nums: [Int], _ target: Int) -> [Int] {\n' +
//       '        \n' +
//       '    }\n' +
//       '}'
//   },
//   {
//     lang: 'Rust',
//     langSlug: 'rust',
//     code: 'impl Solution {\n' +
//       '    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n' +
//       '        \n' +
//       '    }\n' +
//       '}'
//   },
//   {
//     lang: 'Ruby',
//     langSlug: 'ruby',
//     code: '# @param {Integer[]} nums\n' +
//       '# @param {Integer} target\n' +
//       '# @return {Integer[]}\n' +
//       'def two_sum(nums, target)\n' +
//       '    \n' +
//       'end'
//   },
//   {
//     lang: 'PHP',
//     langSlug: 'php',
//     code: 'class Solution {\n' +
//       '\n' +
//       '    /**\n' +
//       '     * @param Integer[] $nums\n' +
//       '     * @param Integer $target\n' +
//       '     * @return Integer[]\n' +
//       '     */\n' +
//       '    function twoSum($nums, $target) {\n' +
//       '        \n' +
//       '    }\n' +
//       '}'
//   },
//   {
//     lang: 'Dart',
//     langSlug: 'dart',
//     code: 'class Solution {\n' +
//       '  List<int> twoSum(List<int> nums, int target) {\n' +
//       '    \n' +
//       '  }\n' +
//       '}'
//   },
//   {
//     lang: 'Scala',
//     langSlug: 'scala',
//     code: 'object Solution {\n' +
//       '    def twoSum(nums: Array[Int], target: Int): Array[Int] = {\n' +
//       '        \n' +
//       '    }\n' +
//       '}'
//   },
//   {
//     lang: 'Elixir',
//     langSlug: 'elixir',
//     code: 'defmodule Solution do\n' +
//       '  @spec two_sum(nums :: [integer], target :: integer) :: [integer]\n' +
//       '  def two_sum(nums, target) do\n' +
//       '    \n' +
//       '  end\n' +
//       'end'
//   },
//   {
//     lang: 'Erlang',
//     langSlug: 'erlang',
//     code: '-spec two_sum(Nums :: [integer()], Target :: integer()) -> [integer()].\n' +
//       'two_sum(Nums, Target) ->\n' +
//       '  .'
//   },
//   {
//     lang: 'Racket',
//     langSlug: 'racket',
//     code: '(define/contract (two-sum nums target)\n' +
//       '  (-> (listof exact-integer?) exact-integer? (listof exact-integer?))\n' +
//       '  )'
//   }
// ]
