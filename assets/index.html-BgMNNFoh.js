import{_ as i,c as a,a as n,o as l}from"./app-DDou_qg2.js";const e={};function t(p,s){return l(),a("div",null,s[0]||(s[0]=[n(`<p>笔者近来和朋友谈论了有关C语言的资源管理方式，在ISO C中，资源管理一直都以很原始的方式进行——函数库提供<code>open</code>和<code>close</code>接口，由程序员亲自管理销毁资源的时机，更进一步无非是使用<code>goto</code>这样原始的关键字来去重。</p><h2 id="gnu-c-资源管理" tabindex="-1"><a class="header-anchor" href="#gnu-c-资源管理"><span>GNU C 资源管理</span></a></h2><p>在GNU Extensions的加持下，我们有<code>cleanup</code>属性，可以为变量指定一个在离开作用域时自动执行的函数：</p><div class="language-c line-numbers-mode" data-ext="c" data-title="c"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes one-dark-pro one-light vp-code"><code><span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">#include</span><span style="--shiki-dark:#98C379;--shiki-light:#50A14F;"> &lt;stdio.h&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">void</span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">fcleanup</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">FILE</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">**</span><span style="--shiki-dark:#E06C75;--shiki-dark-font-style:italic;--shiki-light:#383A42;--shiki-light-font-style:inherit;"> fp</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">)</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">{</span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">  printf</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#98C379;--shiki-light:#50A14F;">&quot;cleaning</span><span style="--shiki-dark:#56B6C2;--shiki-light:#0184BC;">\\n</span><span style="--shiki-dark:#98C379;--shiki-light:#50A14F;">&quot;</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">);</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">  if</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;"> (</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">*</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">fp) {</span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">    fclose</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">*</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">fp);</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">  }</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">int</span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">main</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">()</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">{</span></span>
<span class="line highlighted"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">  FILE</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">*</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;"> fp </span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">__attribute__</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">((</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">cleanup</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(fcleanup))) </span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">=</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;"> fopen</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#98C379;--shiki-light:#50A14F;">&quot;file.txt&quot;</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">, </span><span style="--shiki-dark:#98C379;--shiki-light:#50A14F;">&quot;w&quot;</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">);</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>fp</code>离开作用域时，也就是主函数结束时，会自动运行<code>fcleanup</code>，如果使用<code>-std=gnu23</code>，那么也可以这么书写属性：</p><div class="language-c line-numbers-mode" data-ext="c" data-title="c"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes one-dark-pro one-light vp-code"><code><span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">FILE</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">*</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;"> fp [[</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">gnu::cleanup</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(fcleanup)]] </span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">=</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;"> fopen</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#98C379;--shiki-light:#50A14F;">&quot;file.txt&quot;</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">,</span><span style="--shiki-dark:#98C379;--shiki-light:#50A14F;"> &quot;w&quot;</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">);</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>这个方案适用于<code>clang</code>和<code>gcc</code>，但缺点是我们需要为每个类型重写一个释放函数。</p><blockquote><p>因为如果要释放<code>FILE*</code>类型的资源，我们需要用以<code>FILE**</code>为参数的函数</p></blockquote><h2 id="defer" tabindex="-1"><a class="header-anchor" href="#defer"><span>DEFER</span></a></h2><p>写过<code>zig</code>等语言的读者可能会了解<code>defer</code>这个关键字，简单来说，<code>defer</code>定义一段表达式，它会在离开当前作用域时执行：</p><div class="language-zig line-numbers-mode" data-ext="zig" data-title="zig"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes one-dark-pro one-light vp-code"><code><span class="line"><span>const std = @import(&quot;std&quot;);</span></span>
<span class="line"><span>const print = std.debug.print;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>pub fn main() !void {</span></span>
<span class="line"><span>    defer print(&quot;exec third\\n&quot;, .{});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (false) {</span></span>
<span class="line"><span>        defer print(&quot;will not exec\\n&quot;, .{});</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    defer {</span></span>
<span class="line"><span>        print(&quot;exec second\\n&quot;, .{});</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    defer {</span></span>
<span class="line"><span>        print(&quot;exec first\\n&quot;, .{});</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>zig</code>用这种语法将资源申请和释放写在一起，这样既保证了不会遗漏释放流程，也确保了<strong>释放</strong>流程的可自定义性，我们希望C语言也能有类似的功能，该如何实现呢？</p><h2 id="gnu-nested-function" tabindex="-1"><a class="header-anchor" href="#gnu-nested-function"><span>GNU Nested Function</span></a></h2><p>实际上，GNU C允许用户定义嵌套函数：</p><div class="language-c line-numbers-mode" data-ext="c" data-title="c"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes one-dark-pro one-light vp-code"><code><span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">int</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;"> </span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">main</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">() {</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">  int</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;"> foo</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">() {</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">    return</span><span style="--shiki-dark:#D19A66;--shiki-light:#986801;"> 0</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">;</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">  return</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;"> foo</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">();</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>这种特性只有gcc支持，clang不支持，甚至g++也不支持。</p></blockquote><p>我们可以利用这个特性来封装一块代码块：</p><div class="language-c line-numbers-mode" data-ext="c" data-title="c"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes one-dark-pro one-light vp-code"><code><span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">int</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;"> </span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">main</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">()</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">{</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">  void</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;"> fcleanup</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">int**</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">) {</span></span>
<span class="line"><span style="--shiki-dark:#7F848E;--shiki-dark-font-style:italic;--shiki-light:#A0A1A7;--shiki-light-font-style:italic;">    // code block here</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">  }</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">  int*</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;"> fcleanup_placeholder </span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">__attribute__</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">((</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">cleanup</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(fcleanup), unused)) </span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">=</span><span style="--shiki-dark:#D19A66;--shiki-light:#986801;"> NULL</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">;</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样，我们写在函数中的代码就可以做出类似<code>defer</code>一样的行为，我们将该功能封装成宏：</p><div class="language-c line-numbers-mode" data-ext="c" data-title="c"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes one-dark-pro one-light vp-code"><code><span class="line"><span style="--shiki-dark:#7F848E;--shiki-dark-font-style:italic;--shiki-light:#A0A1A7;--shiki-light-font-style:italic;">// 用来生成不重复ID的工具宏</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">#define</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;"> DEFER_CONCAT</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#E06C75;--shiki-dark-font-style:italic;--shiki-light:#383A42;--shiki-light-font-style:inherit;">a</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">, </span><span style="--shiki-dark:#E06C75;--shiki-dark-font-style:italic;--shiki-light:#383A42;--shiki-light-font-style:inherit;">b</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">) </span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">DEFER_CONCAT_INNER</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">(a</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">,</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;"> b)</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">#define</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;"> DEFER_CONCAT_INNER</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#E06C75;--shiki-dark-font-style:italic;--shiki-light:#383A42;--shiki-light-font-style:inherit;">a</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">, </span><span style="--shiki-dark:#E06C75;--shiki-dark-font-style:italic;--shiki-light:#383A42;--shiki-light-font-style:inherit;">b</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">) a##b</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">#define</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;"> DEFER_UNIQUE_NAME</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#E06C75;--shiki-dark-font-style:italic;--shiki-light:#383A42;--shiki-light-font-style:inherit;">base</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">) </span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">DEFER_CONCAT</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">(base</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">,</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;"> __COUNTER__)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-dark:#7F848E;--shiki-dark-font-style:italic;--shiki-light:#A0A1A7;--shiki-light-font-style:italic;">// DEFER 实现</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">#define</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;"> DEFER_IMPL</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#E06C75;--shiki-dark-font-style:italic;--shiki-light:#383A42;--shiki-light-font-style:inherit;">fname</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">, </span><span style="--shiki-dark:#E06C75;--shiki-dark-font-style:italic;--shiki-light:#383A42;--shiki-light-font-style:inherit;">phname</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">, ...)                                   </span><span style="--shiki-dark:#56B6C2;--shiki-light:#0184BC;">\\</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">  void</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;"> fname</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">int**</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">)</span><span style="--shiki-dark:#56B6C2;--shiki-light:#0184BC;">                                                      \\</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">  {                                                                      </span><span style="--shiki-dark:#56B6C2;--shiki-light:#0184BC;">\\</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">    __VA_ARGS__                                                          </span><span style="--shiki-dark:#56B6C2;--shiki-light:#0184BC;">\\</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">  }                                                                      </span><span style="--shiki-dark:#56B6C2;--shiki-light:#0184BC;">\\</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">  int*</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;"> phname </span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">__attribute__</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">cleanup</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">(fname)</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">,</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;"> unused</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">)</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">)</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;"> =</span><span style="--shiki-dark:#D19A66;--shiki-light:#986801;"> NULL</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">#define</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;"> DEFER</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(...)                                                       </span><span style="--shiki-dark:#56B6C2;--shiki-light:#0184BC;">\\</span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">  DEFER_IMPL</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">DEFER_UNIQUE_NAME</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">(defer_block)</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">,</span><span style="--shiki-dark:#56B6C2;--shiki-light:#0184BC;">                             \\</span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">             DEFER_UNIQUE_NAME</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">(defer_block_ph)</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">,</span><span style="--shiki-dark:#56B6C2;--shiki-light:#0184BC;">                          \\</span></span>
<span class="line"><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">             __VA_ARGS__)</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>测试一下：</p><div class="language-c line-numbers-mode" data-ext="c" data-title="c"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes one-dark-pro one-light vp-code"><code><span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">int</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;"> </span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">main</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">() </span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">{</span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">  DEFER</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">printf</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#98C379;--shiki-light:#50A14F;">&quot;on exit</span><span style="--shiki-dark:#56B6C2;--shiki-light:#0184BC;">\\n</span><span style="--shiki-dark:#98C379;--shiki-light:#50A14F;">&quot;</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">););</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">  printf</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#98C379;--shiki-light:#50A14F;">&quot;in function body</span><span style="--shiki-dark:#56B6C2;--shiki-light:#0184BC;">\\n</span><span style="--shiki-dark:#98C379;--shiki-light:#50A14F;">&quot;</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">);</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>输出：</p><div class="language-plaintext line-numbers-mode" data-ext="plaintext" data-title="plaintext"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes one-dark-pro one-light vp-code"><code><span class="line"><span>in function body</span></span>
<span class="line"><span>on exit</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="blocks" tabindex="-1"><a class="header-anchor" href="#blocks"><span>Blocks</span></a></h2><p>说完了gcc，我们来看clang，对于clang来说，没有嵌套函数这样方便的功能，但它有名为<code>blocks</code>的特性，通过<code>-fblocks</code>开启，它定义了一种新的函数指针，可以将代码块封装为函数：</p><div class="language-c line-numbers-mode" data-ext="c" data-title="c"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes one-dark-pro one-light vp-code"><code><span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">int</span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">main</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">()</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">{</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">  void</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">^</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">fblock)(</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">void</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">) </span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">=</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;"> ^</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">{</span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">    printf</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#98C379;--shiki-light:#50A14F;">&quot;hello in block&quot;</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">);</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">  };</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样的一个代码块可以作为函数被调用，那么，我们可以直接为它定义一个<code>cleanup</code>属性，让其在<code>cleanup</code>时调用自己：</p><div class="language-c line-numbers-mode" data-ext="c" data-title="c"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes one-dark-pro one-light vp-code"><code><span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">void</span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">defer_block_cleanup</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">void</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;"> (</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">^*</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">block</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">)(</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">void</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">))</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">{</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">  if</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;"> (</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">*</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">block) {</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">    (</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">*</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">block)();</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">  }</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">int</span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">main</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">()</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">{</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">  void</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">^</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">fblock)(</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">void</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">) </span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">__attribute__</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">((</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">cleanup</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(defer_block_cleanup), unused)) </span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">=</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;"> ^</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">{</span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">    printf</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#98C379;--shiki-light:#50A14F;">&quot;hello in block&quot;</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">);</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">  };</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>同样将其封装为宏：</p><div class="language-c line-numbers-mode" data-ext="c" data-title="c"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes one-dark-pro one-light vp-code"><code><span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">void</span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">defer_block_cleanup</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">void</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;"> (</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">^*</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">block</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">)(</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">void</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">))</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">{</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">  if</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;"> (</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">*</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">block) {</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">    (</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">*</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">block)();</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">  }</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">#define</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;"> DEFER</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(...)                                                       </span><span style="--shiki-dark:#56B6C2;--shiki-light:#0184BC;">\\</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">  void</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;"> (</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">^</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">DEFER_UNIQUE_NAME</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">(defer_block)</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">)(</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">void</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">)                           </span><span style="--shiki-dark:#56B6C2;--shiki-light:#0184BC;">\\</span></span>
<span class="line"><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">    __attribute__</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">cleanup</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">(defer_block_cleanup)</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">,</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;"> unused</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">)</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">)</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;"> =</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;"> (</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">^</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">{          </span><span style="--shiki-dark:#56B6C2;--shiki-light:#0184BC;">\\</span></span>
<span class="line"><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">      __VA_ARGS__ })</span></span>
<span class="line"><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">#define</span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;"> DEFER_IF</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#E06C75;--shiki-dark-font-style:italic;--shiki-light:#383A42;--shiki-light-font-style:inherit;">cond</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">, ...) </span><span style="--shiki-dark:#61AFEF;--shiki-light:#4078F2;">DEFER</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">(</span><span style="--shiki-dark:#C678DD;--shiki-light:#A626A4;">if</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;"> (</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">cond</span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">){</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;"> __VA_ARGS__ </span><span style="--shiki-dark:#ABB2BF;--shiki-light:#383A42;">}</span><span style="--shiki-dark:#E06C75;--shiki-light:#383A42;">)</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>能够做到和上面相同的效果。</p><blockquote><p>这里也解释了为什么gcc的实现使用空指针，因为clang的实现必须占用一个函数指针，为了宏的效果相同，所以gcc版本使用指针占位符</p></blockquote><h2 id="写在后面" tabindex="-1"><a class="header-anchor" href="#写在后面"><span>写在后面</span></a></h2><p>本文代码仓库：<a href="https://github.com/Dessera/cdefer" target="_blank" rel="noopener noreferrer">cdefer</a></p><p>说实在的，这种实现高度依赖编译器特性，不应看作一种<strong>行之有效</strong>的解决方案，但无奈标准直到C23都没有进一步优化资源管理手段，文中提到的<code>blocks</code>、<code>cleanup</code>和<code>defer</code>等特性也是遥遥无期。</p><p>作为C语言爱好者，笔者真切希望标准能给出官方的新资源管理方案。</p>`,37)]))}const k=i(e,[["render",t],["__file","index.html.vue"]]),d=JSON.parse('{"path":"/article/qwdr1dau/","title":"C语言资源管理实践-DEFER","lang":"zh-CN","frontmatter":{"title":"C语言资源管理实践-DEFER","createTime":"2024/12/20 12:18:17","permalink":"/article/qwdr1dau/","tags":["C","GNU","资源管理"],"description":"笔者近来和朋友谈论了有关C语言的资源管理方式，在ISO C中，资源管理一直都以很原始的方式进行——函数库提供open和close接口，由程序员亲自管理销毁资源的时机，更进一步无非是使用goto这样原始的关键字来去重。 GNU C 资源管理 在GNU Extensions的加持下，我们有cleanup属性，可以为变量指定一个在离开作用域时自动执行的函数：...","head":[["meta",{"property":"og:url","content":"https://dessera.github.io/article/qwdr1dau/"}],["meta",{"property":"og:site_name","content":"Dessera Lab"}],["meta",{"property":"og:title","content":"C语言资源管理实践-DEFER"}],["meta",{"property":"og:description","content":"笔者近来和朋友谈论了有关C语言的资源管理方式，在ISO C中，资源管理一直都以很原始的方式进行——函数库提供open和close接口，由程序员亲自管理销毁资源的时机，更进一步无非是使用goto这样原始的关键字来去重。 GNU C 资源管理 在GNU Extensions的加持下，我们有cleanup属性，可以为变量指定一个在离开作用域时自动执行的函数：..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-12-20T05:15:46.000Z"}],["meta",{"property":"article:tag","content":"C"}],["meta",{"property":"article:tag","content":"GNU"}],["meta",{"property":"article:tag","content":"资源管理"}],["meta",{"property":"article:modified_time","content":"2024-12-20T05:15:46.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"C语言资源管理实践-DEFER\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2024-12-20T05:15:46.000Z\\",\\"author\\":[]}"]]},"headers":[],"readingTime":{"minutes":3.33,"words":998},"git":{"updatedTime":1734671746000,"contributors":[{"name":"Dessera","username":"Dessera","email":"dessera@qq.com","commits":1,"avatar":"https://avatars.githubusercontent.com/Dessera?v=4","url":"https://github.com/Dessera"}]},"autoDesc":true,"filePathRelative":"C&CPP/C语言资源管理实践-DEFER.md","categoryList":[{"id":"135ccb","sort":10002,"name":"C&CPP"}]}');export{k as comp,d as data};
