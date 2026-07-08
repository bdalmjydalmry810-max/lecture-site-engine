# المحاضرة — EDA & Data and Sampling Distributions (التحليل الاستكشافي وتوزيعات العينات)

> **المادة:** الاحصاء التطبيقي لعلم البيانات (القسم النظري) | **الموضوع:** الهستوغرام، مخططات الكثافة، البيانات الفئوية، القيمة المتوقعة، الارتباط، مقارنة المتغيرات، أخذ العينات، التحيز، Bootstrap

---

## 📌 خريطة التكامل (أين تقع هذه المحاضرة في الدورة؟)

| المرحلة | الأدوات | المخرجات |
| --- | --- | --- |
| جمع البيانات وتنظيفها | `pandas`، `tidyverse`، `dplyr` | بيانات نظيفة |
| **EDA — التحليل الاستكشافي ← أنت هنا** | `histogram`، `boxplot`، `density plot`، `scatterplot`، `bar chart`، `correlation` | فهم التوزيع والعلاقات |
| **أخذ العينات والتوزيعات ← أنت هنا أيضاً** | `random sampling`، `bootstrap`، `standard error`، `sampling distribution` | تقدير دقيق من عينات |
| الاختبارات الإحصائية | `t-test`، `ANOVA`، `chi-square`، `p-value` | قرارات مبنية على بيانات |
| النمذجة والتنبؤ | `regression`، `classification`، `ML models` | نماذج تنبؤية |

> **نوع هذه المحاضرة:** مزدوج — EDA (استكمال: `histogram`، `density plot`، `bar chart`، `mode`، `expected value`، `correlation`، `scatterplot`، `multiple variables`) + Data & Sampling Distributions (`random sampling`، `bias`، `bootstrap`).

---

## الجزء الأول: الشرح التفصيلي (سطر بسطر / فقرة بفقرة)

---

### 1. Frequency Tables & Histograms — استكمال

#### النص الأصلي يقول:
> "It is important to include the empty bins; the fact that there are no values in those bins is useful information. It can also be useful to experiment with different bin sizes. If they are too large, important features of the distribution can be obscured. If they are too small, the result is too granular, and the ability to see the bigger picture is lost."

#### الشرح المبسّط:
الـ`histogram` يقسّم البيانات إلى صناديق (`bins`) ثم يعدّ عدد القيم في كل صندوق. **اختيار حجم الـ`bin`** فن في حد ذاته:

| حجم الـ`bin` | المشكلة | النتيجة |
| --- | --- | --- |
| كبير جداً | تُدمج تفاصيل مهمة | توزيع مُبسَّط ومُضلِّل |
| صغير جداً | ضجيج زائد | لا ترى النمط العام |
| مناسب | توازن بين التفاصيل والنمط | صورة واضحة للتوزيع |

**الصناديق الفارغة مهمة:** تُخبرنا أن لا قيم في تلك النطاقات — وهذه معلومة قيّمة بحد ذاتها.

**لماذا؟** التوزيع الحقيقي للبيانات يظهر من خلال شكل الـ`histogram` — عشر ولايات تتراكم في نفس النطاق قد تُشير إلى ظاهرة تستحق التحقيق.

#### 💡 التشبيه:
> مثل تجميع صور في ألبوم — إذا وضعت كل صورة في صفحة منفصلة (bin صغير جداً) لن ترى الرحلة كاملة، وإذا دمجت كل الصور في صفحة واحدة (bin كبير جداً) لن ترى أي تفصيل.
> **وجه الشبه:** حجم الـ`bin` = حجم الصفحة في الألبوم.

---

### 1.1. كود الهستوغرام في R وPython

#### النص الأصلي يقول:

#### الشرح المبسّط:
هذا القسم يعرض كود رسم الهستوغرام في R وPython مع شرح التنفيذ.
> "To create a histogram corresponding to Table 1-5 in R, use the hist function with the breaks argument: `hist(state[['Population']], breaks=breaks)`"
> "pandas supports histograms for data frames with the DataFrame.plot.hist method. Use the keyword argument bins to define the number of bins."

#### 💻 الكود: رسم Histogram في R

#### ما هذا الكود؟
> يرسم هستوغرام لتوزيع سكان الولايات الأمريكية، مع تحديد حجم الـbins يدوياً.

```r
# Draw histogram of state populations with custom breaks
hist(state[['Population']], breaks=breaks)
```

#### شرح كل سطر:
1. `hist(state[['Population']], breaks=breaks)` → تستخرج عمود السكان وترسم histogram بنقاط الفصل المحددة مسبقاً في `breaks`.

**المكتبات المطلوبة (Imports):**
> لا تحتاج مكتبات إضافية — `hist()` دالة أساسية في R.

**الناتج المتوقع:**
> رسم بياني يظهر توزيع أعداد السكان عبر bins، مع الفراغات التي تُظهر نطاقات بلا بيانات.

---

#### 💻 الكود: رسم Histogram في Python

#### ما هذا الكود؟
> رسم هستوغرام مع ضبط حجم الرسم وتسمية المحور.

```python
# Plot histogram of population in millions, set figure size
ax = (state['Population'] / 1_000_000).plot.hist(figsize=(4, 4))
# Label the x-axis
ax.set_xlabel('Population (millions)')
```

#### شرح كل سطر:
1. `state['Population'] / 1_000_000` → تحويل القيم من أرقام مطلقة إلى ملايين (تحسين القراءة).
2. `.plot.hist(figsize=(4, 4))` → رسم الـ`histogram` بحجم 4×4 بوصة.
3. `ax.set_xlabel('Population (millions)')` → تسمية المحور الأفقي.

**المكتبات المطلوبة (Imports):**
> `import pandas as pd` | `import matplotlib.pyplot as plt`

**الناتج المتوقع:**
> رسم histogram يُظهر معظم الولايات بسكان أقل من 10 مليون، مع ذيل طويل يمتد لليمين.

---

### 1.2. خصائص الهستوغرام الصحيح

#### النص الأصلي يقول:
> "In general, histograms are plotted such that: Empty bins are included in the graph. Bins are of equal width. The number of bins (or, equivalently, bin size) is up to the user. Bars are contiguous—no empty space shows between bars, unless there is an empty bin."

#### الشرح المبسّط:
أربع قواعد للـ`histogram` الصحيح:

| القاعدة | التفسير | لماذا مهم؟ |
| --- | --- | --- |
| الصناديق الفارغة مُدرَجة | حتى لو عدد = 0 | إخفاؤها يُزيف التوزيع |
| عرض متساوٍ للـbins | نفس الفاصل الزمني | يُتيح المقارنة البصرية |
| عدد الـbins يختاره المستخدم | لا قيمة "صحيحة" | يعتمد على البيانات والهدف |
| الأعمدة متلاصقة | لا فراغ بين الأعمدة | الاستثناء: فقط عند وجود bin فارغ |

**الفهم الخاطئ الشائع ❌:** الظن أن الـ`histogram` والـ`bar chart` شيء واحد.
**الفهم الصحيح ✅:** في `histogram` المحور x رقمي مستمر وأعمدته متلاصقة؛ في `bar chart` المحور x فئات منفصلة وأعمدته متباعدة.

---

### 1.3. اللحظات الإحصائية (Statistical Moments)

#### النص الأصلي يقول:
> "In statistical theory, location and variability are referred to as the first and second moments of a distribution. The third and fourth moments are called skewness and kurtosis. Skewness refers to whether the data is skewed to larger or smaller values, and kurtosis indicates the propensity of the data to have extreme values. Generally, metrics are not used to measure skewness and kurtosis; instead, these are discovered through visual displays."

#### الشرح المبسّط:
| اللحظة | الاسم | المعنى |
| --- | --- | --- |
| الأولى | `Location` (Mean/Median) | أين تتمركز البيانات؟ |
| الثانية | `Variability` (Variance/SD) | كم تتشتت البيانات؟ |
| الثالثة | `Skewness` | هل البيانات منحازة لليمين أو اليسار؟ |
| الرابعة | `Kurtosis` | هل توجد قيم متطرفة (ذيول سميكة)؟ |

**في الممارسة:** لا نحسب `skewness` و`kurtosis` بأرقام — بل نكتشفها بصرياً من الـ`histogram` أو `density plot`.

#### 💡 التشبيه:
> مثل وصف شكل جبل — الأول: أين الجبل (المتوسط)، الثاني: كم هو واسع (الانتشار)، الثالث: هل ينحدر لليمين أو اليسار (الانحراف)، الرابع: هل قمته حادة أم مسطحة (الكرتوزية).
> **وجه الشبه:** اللحظات الأربع = أبعاد وصف شكل الجبل.

---

### 2. Density Plots and Estimates — مخططات الكثافة

#### النص الأصلي يقول:
> "Related to the histogram is a density plot, which shows the distribution of data values as a continuous line. A density plot can be thought of as a smoothed histogram, although it is typically computed directly from the data through a kernel density estimate."

#### الشرح المبسّط:
الـ`density plot` هو `histogram` مُمَلَّس يتحوّل من أعمدة إلى خط مستمر. يُحسَب باستخدام `kernel density estimate (KDE)` — خوارزمية تضع "نافذة" حول كل نقطة بيانات وتجمع التأثيرات.

**الفارق الجوهري عن الـ`histogram`:**
- في `histogram`: المحور y = **عدد** العناصر في كل bin.
- في `density plot`: المحور y = **كثافة احتمالية** — المساحة تحت المنحنى الكلية = 1.

**لماذا؟** يُتيح لنا قراءة نسبة البيانات بين أي نقطتين كمساحة تحت المنحنى.

#### 💡 التشبيه:
> مثل تمهيد طريق وعر — الـ`histogram` هو الطريق الأصلي بمطبّاته، والـ`density plot` هو الطريق بعد رصفه بشكل ناعم.
> **وجه الشبه:** `bandwidth` في KDE = درجة النعومة في الرصف.

---

### 2.1. كود Density Plot في R وPython

#### النص الأصلي يقول:
> يعرض الكود كيفية رسم density plot في R باستخدام `hist()` و `density()`.

#### الشرح المبسّط:
هذا القسم يعرض كود رسم منحنى الكثافة في R.

#### 💻 الكود: Density Plot في R

#### ما هذا الكود؟
> رسم histogram بمحور y نسبي ثم إضافة منحنى الكثافة فوقه.

```r
# Draw histogram with density (proportion) on y-axis instead of count
hist(state[['Murder.Rate']], freq=FALSE)
# Overlay density curve in blue with line width 3
lines(density(state[['Murder.Rate']]), lwd=3, col='blue')
```

#### شرح كل سطر:
1. `hist(..., freq=FALSE)` → يرسم الـ`histogram` بالكثافة الاحتمالية بدلاً من العدد.
2. `density(state[['Murder.Rate']])` → يحسب `kernel density estimate` للبيانات.
3. `lines(..., lwd=3, col='blue')` → يضيف المنحنى فوق الـ`histogram` بخط أزرق عريض.

**المكتبات المطلوبة (Imports):**
> دوال أساسية في R — لا مكتبات إضافية.

**الناتج المتوقع:**
> `histogram` مع منحنى كثافة أزرق فوقه — يُظهر تقدير الكثافة الاحتمالية لمعدلات الجريمة.

---

#### 💻 الكود: Density Plot في Python

#### ما هذا الكود؟
> رسم histogram مع density overlay وضبط المحور السيني.

```python
# Plot histogram with density overlay, restrict x-axis from 0 to 12
ax = state['Murder.Rate'].plot.hist(density=True, xlim=[0,12], bins=range(1,12))
# Add kernel density estimate on the same axes
state['Murder.Rate'].plot.density(ax=ax)
# Label x-axis
ax.set_xlabel('Murder Rate (per 100,000)')
```

#### شرح كل سطر:
1. `density=True` → يُحوّل المحور y من عدد إلى كثافة احتمالية.
2. `xlim=[0,12]` → يحدد نطاق المحور x من 0 إلى 12.
3. `bins=range(1,12)` → يحدد مواضع الـbins يدوياً.
4. `plot.density(ax=ax)` → يرسم منحنى KDE على نفس المحور (بفضل الـ`ax` argument).
5. `set_xlabel(...)` → تسمية المحور.

**المكتبات المطلوبة (Imports):**
> `import pandas as pd` | `import matplotlib.pyplot as plt`

**الناتج المتوقع:**
> رسم مزدوج: أعمدة الـ`histogram` بالكثافة + منحنى أملس فوقها.

#### نقطة مهمة ⚠️:
> الـ`ax` argument يسمح لدالتين مختلفتين برسم رسومهما على نفس الإطار — بدونه ستُنشئ كل دالة رسماً منفصلاً!

---

### 2.2. تقدير الكثافة (Density Estimation)

#### النص الأصلي يقول:
> "Density estimation is a rich topic with a long history in statistical literature. In fact, over 20 R packages have been published that offer functions for density estimation. The density estimation methods in pandas and scikit-learn also offer good implementations."

#### الشرح المبسّط:
`Kernel Density Estimation (KDE)` موضوع ضخم — أكثر من 20 حزمة R مكرّسة له! لكن للعمل اليومي في علم البيانات، الدوال الأساسية (`density()` في R، `.plot.density()` في Python) تكفي في معظم الحالات.

**حزم متخصصة في R:** `ASH`، `KernSmooth`.
**في Python:** `sklearn.neighbors.KernelDensity` في `scikit-learn`.

#### 🤔 تفعيل الفهم (اسأل نفسك):
> **سؤال:** إذا رأيت `density plot` يحتوي قمتين (bimodal)، ماذا يعني ذلك في الواقع؟
> **لماذا هذا مهم؟** يُشير إلى وجود مجموعتين مختلفتين في البيانات — قد تحتاج لتحليل كل مجموعة منفصلة.

---

### 3. Bar Charts — الرسوم البيانية الشريطية

#### النص الأصلي يقول:
> "Note that a bar chart resembles a histogram; in a bar chart the x-axis represents different categories of a factor variable, while in a histogram the x-axis represents values of a single variable on a numeric scale. In a histogram, the bars are typically shown touching each other, with gaps indicating values that did not occur in the data. In a bar chart, the bars are shown separate from one another."

#### الشرح المبسّط:
**الـ`bar chart`** يُستخدم للبيانات الفئوية (`categorical data`) — المحور x فئات لا أرقام.

| الخاصية | `Histogram` | `Bar Chart` |
| --- | --- | --- |
| المحور x | قيم رقمية مستمرة | فئات منفصلة |
| الأعمدة | متلاصقة (مع فراغ عند bin فارغ) | متباعدة |
| نوع البيانات | كمية (`numeric`) | فئوية (`categorical`) |
| مثال | توزيع الأعمار | سبب التأخير في الطيران |

**Pie Charts:** بديل للـ`bar chart` لكن خبراء التصور البياني يُفضّلون الـ`bar chart` لأنه أكثر دقة بصرياً في المقارنات.

#### 💡 التشبيه:
> `bar chart` كقائمة تسوق بفئات منفصلة (خضار، فاكهة، ألبان) — لا ترتيب أو اتصال بين الفئات.
> **وجه الشبه:** الفئات المتباعدة = أعمدة الـ`bar chart` المتباعدة.

---

### 3.1. البيانات الرقمية كبيانات فئوية

#### النص الأصلي يقول:
> "In 'Frequency Tables and Histograms' on page 22, we looked at frequency tables based on binning the data. This implicitly converts the numeric data to an ordered factor. Converting numeric data to categorical data is an important and widely used step in data analysis since it reduces the complexity (and size) of the data."

#### الشرح المبسّط:
عندما نضع البيانات في **bins**، نحوّل رقماً مستمراً (مثل الدخل: \$47,832) إلى فئة (مثل "\$40K–\$50K"). هذا التحويل يُبسّط التحليل ويُساعد في اكتشاف الأنماط في المراحل الأولى.

**لماذا مهم؟** يُقلّل من التعقيد — بدلاً من آلاف القيم الفريدة، لديك 10 فئات فقط.

---

### 4. Mode — المنوال

#### النص الأصلي يقول:
> "The mode is the value—or values in case of a tie—that appears most often in the data. For example, the mode of the cause of delay at Dallas/Fort Worth airport is 'Inbound.' The mode is a simple summary statistic for categorical data, and it is generally not used for numeric data."

#### الشرح المبسّط:
الـ`mode` هو القيمة الأكثر تكراراً في البيانات.

**متى نستخدمه؟**
- ✅ للبيانات الفئوية (سبب التأخير، اللون المفضل، النوع)
- ❌ نادراً للبيانات الرقمية المستمرة (يكاد لا يتكرر أي رقم بالضبط)

**ملاحظة:** يُمكن أن يكون للتوزيع أكثر من `mode` واحد (بيانات `bimodal` أو `multimodal`).

---

### 5. Expected Value — القيمة المتوقعة

#### النص الأصلي يقول:
> "A special type of categorical data is data in which the categories represent or can be mapped to discrete values on the same scale... This data can be summed up, for financial purposes, in a single 'expected value,' which is a form of weighted mean, in which the weights are probabilities."

#### الشرح المبسّط:
الـ`Expected Value` هو **متوسط مرجّح** حيث الأوزان هي الاحتمالات. في مثال الكتاب:
- 5% يشتركون بـ\$300/شهر
- 15% يشتركون بـ\$50/شهر
- 80% لا يشتركون (\$0)

#### 📐 المعادلة: Expected Value

$$
EV = \sum_{i} x_i \cdot P(x_i)
$$

**الشرح:**
> - $EV$ = القيمة المتوقعة
> - $x_i$ = قيمة النتيجة i
> - $P(x_i)$ = احتمال حدوث النتيجة i

**تطبيق المثال:**

$$
EV = (0.05)(300) + (0.15)(50) + (0.80)(0) = 15 + 7.5 + 0 = 22.5
$$

أي أن القيمة المتوقعة لكل حضور لندوة مجانية = **\$22.50/شهر**.

**لماذا مهم؟** يُستخدم في القرارات المالية، والتسعير، وتقييم المشاريع — يُحوّل السيناريوهات المحتملة إلى رقم واحد للمقارنة.

#### 💡 التشبيه:
> مثل رهان في لعبة — لا تعرف إن كنت ستربح أم تخسر في كل جولة، لكن على المدى الطويل القيمة المتوقعة تُخبرك بما ستكسبه أو تخسره في المتوسط لكل جولة.
> **وجه الشبه:** كل سيناريو محتمل = جانب من جوانب الرهان، الاحتمال = نسبة حدوثه.

#### 🤔 تفعيل الفهم (اسأل نفسك):
> **سؤال:** إذا كانت EV = \$22.50 ولكن التكلفة لاستضافة الندوة \$25، هل يستحق الأمر؟
> **لماذا هذا مهم؟** القرار يعتمد على EV مقارنة بالتكلفة — هذا بالضبط كيف تعمل الشركات في قرارات التسويق.

---

### 6. Correlation — الارتباط

#### النص الأصلي يقول:
> "The correlation coefficient measures the extent to which two paired variables (e.g., height and weight for individuals) are associated with one another. When high values of v1 go with high values of v2, v1 and v2 are positively associated."

#### الشرح المبسّط:
**معامل الارتباط (`correlation coefficient`)** يقيس **قوة واتجاه** العلاقة بين متغيرين.

#### 📐 المعادلة: Pearson Correlation Coefficient

$$
r = \frac{\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})}{(n-1) \cdot s_x \cdot s_y}
$$

**الشرح:**
> - $r$ = معامل الارتباط (Pearson's r)
> - $x_i, y_i$ = قيم المتغيرين
> - $\bar{x}, \bar{y}$ = متوسط كل متغير
> - $s_x, s_y$ = الانحراف المعياري لكل متغير
> - $n$ = عدد الملاحظات
> - النتيجة دائماً بين -1 و+1

| قيمة r | التفسير |
| --- | --- |
| +1 | ارتباط موجب تام |
| 0.7 إلى 0.9 | ارتباط موجب قوي |
| 0.3 إلى 0.7 | ارتباط موجب معتدل |
| 0 | لا ارتباط |
| -0.3 إلى -0.7 | ارتباط سلبي معتدل |
| -1 | ارتباط سلبي تام |

**مهم للامتحان ⚠️:**
> معامل الارتباط **حساس للقيم الشاذة (`outliers`)**. قيمة واحدة شاذة قد تُغيّر r بشكل جذري. استخدم بدائل قوية مثل `Spearman's rho` عند وجود outliers.

#### 💡 التشبيه:
> مثل قياس هل يمشي شخصان معاً — +1 يعني يمشيان بنفس الاتجاه والسرعة دائماً، -1 يعني كلما تقدم أحدهما تأخر الآخر، 0 يعني حركة كل منهما مستقلة تماماً.
> **وجه الشبه:** الارتباط = مدى تزامن الحركتين.

---

### 6.1. Correlation Matrix — مصفوفة الارتباط

#### النص الأصلي يقول:
> "A correlation matrix (shown in Figure 1-6) is a table where the variables are shown on both rows and columns, and the cell values are the correlations between the variables. Ellipses that are pointed to the top right or top left indicate positively or negatively correlated [variables]."

#### الشرح المبسّط:
عند وجود عدة متغيرات، تُلخّص **مصفوفة الارتباط (`correlation matrix`)** كل العلاقات الثنائية في جدول واحد. في الشكل 1-6 من الكتاب، تُمثَّل قيمة الارتباط بـ**شكل بيضوي** (`ellipse`):

| شكل البيضاوي | المعنى |
| --- | --- |
| مائل لأعلى اليمين (أزرق داكن رفيع) | ارتباط موجب قوي |
| مائل لأعلى اليسار (أحمر داكن رفيع) | ارتباط سلبي قوي |
| دائري منتفخ (فاتح) | ارتباط ضعيف |
| قطر (/) | الارتباط مع النفس = 1 دائماً |

**ملاحظة من الشكل:** `VXX` (مؤشر التقلب) لديه ارتباط **سلبي** مع معظم صناديق الاستثمار الأخرى — منطقي لأنه يرتفع عندما تنخفض الأسواق.

---

### 6.2. معاملات الارتباط الأخرى

#### النص الأصلي يقول:
> "Statisticians long ago proposed other types of correlation coefficients, such as Spearman's rho or Kendall's tau. These are correlation coefficients based on the rank of the data. Since they work with ranks rather than values, these estimates are robust to outliers and can handle certain types of nonlinearities."

#### الشرح المبسّط:
| المعامل | الأساس | المزايا | متى نستخدمه |
| --- | --- | --- | --- |
| `Pearson's r` | القيم الفعلية | الأكثر شيوعاً | بيانات طبيعية بلا outliers |
| `Spearman's rho` | رتب البيانات | قوي ضد outliers | بيانات غير طبيعية أو ترتيبية |
| `Kendall's tau` | رتب البيانات | قوي ضد outliers + مناسب لعينات صغيرة | نفس حالات Spearman |

**للعمل التحليلي اليومي:** يكفي `Pearson's r` في معظم الحالات.

#### 💻 الكود: حساب Correlation في R وPython

```r
# Calculate Pearson correlation between two variables
cor(telecom$T, telecom$VZ)

# Robust correlation using the robust package
library(robust)
covRob(telecom[, c('T', 'VZ')])
```

```python
# Calculate Pearson correlation matrix for all numeric columns
telecom[['T', 'VZ']].corr()

# Spearman correlation
telecom[['T', 'VZ']].corr(method='spearman')
```

---

### 7. Scatterplots — المبعثر

#### النص الأصلي يقول:
> "The standard way to visualize the relationship between two measured data variables is with a scatterplot. The x-axis represents one variable and the y-axis another, and each point on the graph is a record."

#### الشرح المبسّط:
الـ`scatterplot` هو الطريقة المرئية المعيارية لإظهار العلاقة بين متغيرين رقميين. كل نقطة = سجل واحد.

**ما يمكن قراءته من الـ`scatterplot`:**
- الاتجاه (موجب/سلبي/لا يوجد)
- القوة (نقاط مجتمعة = ارتباط قوي، منتشرة = ضعيف)
- الشكل (خطي / غير خطي)
- القيم الشاذة (`outliers`)

#### 💻 الكود: Scatterplot في R وPython

```r
# Plot ATT vs Verizon daily returns
plot(telecom$T, telecom$VZ, xlab='ATT (T)', ylab='Verizon (VZ)')
```

```python
# Create scatter plot of ATT vs Verizon returns
ax = telecom.plot.scatter(x='T', y='VZ', figsize=(4, 4), marker='$\u25EF$')
ax.set_xlabel('ATT (T)')
ax.set_ylabel('Verizon (VZ)')
# Add horizontal and vertical lines at zero
ax.axhline(0, color='grey', lw=1)
ax.axvline(0, color='grey', lw=1)
```

#### شرح كل سطر (Python):
1. `plot.scatter(x='T', y='VZ')` → رسم نقطة لكل يوم: محور x = عائد ATT، محور y = عائد Verizon.
2. `figsize=(4, 4)` → حجم الرسم.
3. `marker='$\u25EF$'` → شكل النقطة (دائرة مفرغة لتقليل التداخل).
4. `axhline(0)` و`axvline(0)` → خطوط مرجعية عند الصفر لسهولة القراءة.

#### ملاحظة:
> في الـ`scatterplot` الوارد في الشكل 1-7 (754 نقطة)، النقاط تتمركز حول الربعين الأعلى-اليمين والأسفل-اليسار — مما يدل على ارتباط موجب (الأسهم ترتفع وتنخفض معاً معظم الوقت).

---

### 7.1. مشكلة الازدحام في الـ`Scatterplot`

#### النص الأصلي يقول:
> "While the plot Figure 1-7 displays only 754 data points, it's already obvious how difficult it is to identify details in the middle of the plot. We will see later how adding transparency to the points, or using hexagonal binning and density plots, can help to find additional structure in the data."

#### الشرح المبسّط:
عند كثرة البيانات، تتداخل النقاط (`overplotting`) ويصعب رؤية الكثافة الحقيقية. الحلول:

| الحل | الطريقة | المزية |
| --- | --- | --- |
| `Transparency` | تخفيف الشفافية (`alpha`) | تظهر مناطق الكثافة العالية أغمق |
| `Hexagonal Binning` | تجميع النقاط في خلايا سداسية | يُظهر الكثافة بدقة عالية |
| `Density/Contour Plot` | تحويل النقاط لمنحنيات كثافة | يُظهر البنية الكامنة |

---

### 8. Two Numeric Variables — متغيران رقميان (Hexagonal Binning وContour)

#### النص الأصلي يقول:
> "Figure 1-8: Hexagonal binning for tax-assessed value versus finished square feet"
> "Figure 1-9 uses contours overlaid onto a scatterplot to visualize the relationship between two numeric variables. The contours are essentially a topographical map to two variables."

#### الشرح المبسّط:

| النوع | الوصف | متى نستخدم |
| --- | --- | --- |
| `Hexagonal Binning` | تقسيم المنطقة لخلايا سداسية، لون كل خلية = عدد النقاط | بيانات كثيفة جداً |
| `Contour Plot` | خطوط تمثل مستويات الكثافة (مثل خريطة التضاريس) | إظهار البنية الكاملة |
| `Heat Map` | ألوان تمثل الكثافة في شبكة مستطيلة | متغيران فئويان أو تحليل 2D |

**الخلاصة:** هذه الأنواع الثلاثة هي المعادل ثنائي الأبعاد للـ`histogram` والـ`density plot`.

#### 💻 الكود: Hexagonal Binning وContour في R وPython

```r
# Hexagonal binning using ggplot2
library(ggplot2)
ggplot(kc_tax0, aes(SqFtTotLiving, TaxAssessedValue)) +
  theme_bw() +
  geom_point(alpha=0.1) +               # Transparent points
  geom_density2d(color='white') +       # Contour lines in white
  labs(x='Finished Square Feet', y='Tax-Assessed Value')
```

```python
# Contour plot using seaborn kdeplot
ax = sns.kdeplot(kc_tax0.SqFtTotLiving, kc_tax0.TaxAssessedValue, ax=ax)
ax.set_xlabel('Finished Square Feet')
ax.set_ylabel('Tax-Assessed Value')
```

---

### 9. Two Categorical Variables — متغيران فئويان

#### النص الأصلي يقول:
> "A useful way to summarize two categorical variables is a contingency table—a table of counts by category. High-grade loans have a very low late/charge-off percentage as compared with lower-grade loans."

#### الشرح المبسّط:
**جدول الطوارئ (`contingency table`)** يُظهر تقاطع فئتين — كم عدد العناصر التي تنتمي لكل مجموعة من المجموعتين.

مثال: درجة القرض (A إلى G) × نتيجة القرض (سُدّد/جارٍ/متأخر/مشطوب):
- القروض درجة A: نسبة تأخر/شطب منخفضة جداً
- القروض درجة G: نسبة تأخر/شطب عالية

**لماذا مهم؟** يُظهر العلاقة بين متغيرين فئويين — أساس اختبار `chi-square`.

---

### 10. Categorical and Numeric Data — فئوي + رقمي

#### النص الأصلي يقول:
> "Boxplots are a simple way to visually compare the distributions of a numeric variable grouped according to a categorical variable."

#### الشرح المبسّط:
عندما نريد مقارنة توزيع متغير رقمي عبر فئات مختلفة، نستخدم **boxplots جنباً إلى جنب**. مثال: مقارنة نسبة التأخر في الطيران عبر شركات طيران مختلفة.

#### 💻 الكود: Boxplot جنباً إلى جنب في R وPython

```r
# Side-by-side boxplots: delay percentage by airline
boxplot(pct_carrier_delay ~ airline, data=airline_stats, ylim=c(0, 50))
```

```python
# Group by airline and create boxplots for delay percentage
ax = airline_stats.boxplot(by='airline', column='pct_carrier_delay')
ax.set_xlabel('')
ax.set_ylabel('Daily % of Delayed Flights')
plt.suptitle('')
```

---

### 10.1. Violin Plots — مخططات الكمان

#### النص الأصلي يقول:
> "[Figure 1-11] Violin plot of percent of airline delays by carrier"

#### الشرح المبسّط:
**`Violin plot`** هو دمج بين `boxplot` و`density plot`:
- يُظهر الوسيط والربيعيات (كـ`boxplot`)
- يُظهر أيضاً شكل التوزيع الكامل (كـ`density plot`)

#### ⚖️ المقايضة: Boxplot مقابل Violin Plot

| | `Boxplot` | `Violin Plot` |
| --- | --- | --- |
| المزايا | بسيط وواضح، يُظهر القيم الشاذة | يُظهر شكل التوزيع كاملاً |
| العيوب | يُخفي شكل التوزيع | أصعب قراءة |
| متى تختاره | مقارنة سريعة، عروض تقديمية | بيانات ذات توزيعات معقدة |

---

### 11. Visualizing Multiple Variables — تصور متغيرات متعددة

#### النص الأصلي يقول:
> "The types of charts used to compare two variables—scatterplots, hexagonal binning, and boxplots—are readily extended to more variables through the notion of conditioning."

#### الشرح المبسّط:
**`Conditioning`** هو تقسيم الرسم حسب قيمة متغير ثالث. في المثال: رسم علاقة المساحة بالقيمة الضريبية مقسّماً حسب الرمز البريدي.

**النتيجة:** ما بدا كـ`cluster` غامض في الرسم الكلي (شكل 1-8) أصبح واضحاً — الرمزان 98105 و98126 لهما قيم ضريبية أعلى بكثير من 98108 و98188.

#### 💻 الكود: Faceted Plot في R وPython

```r
# Create faceted hexbin plots by zip code
ggplot(subset(kc_tax0, ZipCode %in% c(98188, 98105, 98108, 98126)),
       aes(x=SqFtTotLiving, y=TaxAssessedValue)) +
  stat_binhex(color='white') +
  theme_bw() +
  scale_fill_gradient(low='white', high='blue') +
  labs(x='Finished Square Feet', y='Tax-Assessed Value') +
  facet_wrap('ZipCode')  # Split by zip code
```

```python
# Use seaborn FacetGrid for conditioning on zip code
import seaborn as sns
g = sns.FacetGrid(kc_tax0[kc_tax0.ZipCode.isin([98105, 98108, 98126, 98188])],
                  col='ZipCode', col_wrap=2)
g.map(plt.hexbin, 'SqFtTotLiving', 'TaxAssessedValue',
      gridsize=30, mincnt=1, cmap='Blues_r')
```

---

## الجزء الأول (تكملة) — الفصل الثاني: Data and Sampling Distributions — شرح

---

### 12. Population vs Sample — المجتمع والعينة

#### النص الأصلي يقول:
> "A sample is a subset of data from a larger data set; statisticians call this larger data set the population. A population in statistics is not the same thing as in biology—it is a large, defined (but sometimes theoretical or imaginary) set of data."

#### الشرح المبسّط:
| المصطلح | التعريف | مثال |
| --- | --- | --- |
| `Population` | مجموعة البيانات الكاملة (قد تكون نظرية) | كل مرضى داء السكري في العالم |
| `Sample` | مجموعة فرعية منتقاة من المجتمع | 500 مريض في دراسة سريرية |
| `Simple Random Sample` | عينة تُؤخذ بحيث لكل عنصر فرصة متساوية | اختيار عشوائي من قائمة |

**أخذ العينة بدواعي الاستبدال أم بدونه:**
- `With Replacement`: يُعاد العنصر للمجتمع بعد كل سحب (احتمال ثابت)
- `Without Replacement`: لا يُعاد العنصر (يتغير الاحتمال)

**لماذا مهم؟** في علم البيانات نعمل دائماً مع عينات، لذا جودة العينة تحدد جودة الاستنتاجات.

#### 💡 التشبيه:
> `Population` كالبحر، `Sample` كإناء ماء تأخذه للتحليل — التحدي هو أن تكون العينة ممثّلة للبحر كله.
> **وجه الشبه:** جودة التحليل = مدى تمثيل الإناء للبحر كله.

---

### 13. Bias — التحيز

#### النص الأصلي يقول:
> "Statistical bias refers to measurement or sampling errors that are systematic and produced by the measurement or sampling process. An important distinction should be made between errors due to random chance and errors due to bias."

#### الشرح المبسّط:
| نوع الخطأ | الوصف | هل يُصحَّح بزيادة العينة؟ |
| --- | --- | --- |
| `Random Error` | عشوائي، يتوزع حول القيمة الحقيقية | نعم (بالمتوسط) |
| `Bias` | منتظم ومنحاز في اتجاه معين | لا — البيانات الأكثر لا تُصحّح التحيز |

**مثال من الكتاب:** البندقية التي تُصيب دائماً الربع الأعلى-الأيمن من الهدف (تحيز) مقابل بندقية تُصيب مواضع عشوائية حول المركز (خطأ عشوائي فقط).

**Self-Selection Bias:** مراجعات Yelp غير موثوقة كمقياس موضوعي لأن من يكتبون المراجعات لم يُختاروا عشوائياً — يكتبها من لديهم تجارب متطرفة (جيدة جداً أو سيئة جداً).

**لماذا مهم؟** حادثة Literary Digest الشهيرة (1936): استطلاع 2.4 مليون شخص ولكن مع تحيز في اختيارهم (أثرياء فقط) أدى لتنبؤ خاطئ بنتيجة الانتخابات.

#### مهم للامتحان ⚠️:
> **زيادة حجم العينة لا تُصحّح التحيز** — تحيز منهجي + بيانات أكثر = نتائج أسوأ بثقة أعلى.

---

### 14. Random Selection — الاختيار العشوائي

#### النص الأصلي يقول:
> "To avoid the problem of sample bias... George Gallup opted for more scientifically chosen methods to achieve a sample that was representative of the US voting electorate. There are now a variety of methods to achieve representativeness, but at the heart of all of them lies random sampling."

#### الشرح المبسّط:
`Random Sampling` هو حجر الأساس لتجنب التحيز. جالوب نجح في 1936 حيث أخفق Literary Digest لأنه اختار عينة صغيرة لكن **ممثّلة** بدلاً من عينة ضخمة لكن **متحيزة**.

**انتباه:** يجب تعريف "المجتمع" (`population`) بدقة قبل أخذ العينة. مثال: إذا أردنا استطلاع عملاء محتملين، من هم بالضبط؟ كل سكان المدينة؟ زوار الموقع؟ المشتركون في القائمة البريدية؟

---

### 15. Regression to the Mean — الانحدار نحو المتوسط

#### النص الأصلي يقول:
> "Regression to the mean... the children of extremely tall men tend not to be as tall as their father. Regression to the mean, meaning to 'go back,' is distinct from the statistical modeling method of linear regression."

#### الشرح المبسّط:
ظاهرة `Regression to the Mean` تقول: القيم المتطرفة جداً تميل للعودة نحو المتوسط في القياسات اللاحقة.

**مثال جالتون:** الآباء طويلو القامة جداً ينجبون أبناء أطول من المتوسط، لكن ليسوا بنفس طول آبائهم.

**في علم البيانات:** اللاعب الذي سجّل أفضل أداء في الجولة الأولى لن يكون بالضرورة الأفضل في الجولة الثانية — ارتفاعه قد يكون جزئياً من الحظ.

**تحذير:** `Regression to the Mean` ≠ `Linear Regression` رغم تشابه الاسم!

#### 💡 التشبيه:
> مثل رمي نرد وتحصل على 6 — في الرمية القادمة ليس بالضرورة 6 أيضاً، المتوسط سيتجه نحو 3.5.
> **وجه الشبه:** النتيجة المتطرفة = نتيجة الحظ + القدرة الحقيقية، القيمة المتوقعة في القادم ستكون أقل تطرفاً.

---

### 16. Sampling Distribution — توزيع العينة

#### النص الأصلي يقول:
> "It is important to distinguish between the distribution of the individual data points, known as the data distribution, and the distribution of a sample statistic, known as the sampling distribution."

#### الشرح المبسّط:
| المصطلح | التعريف | مثال |
| --- | --- | --- |
| `Data Distribution` | توزيع نقاط البيانات الفردية | توزيع دخول 1000 موظف |
| `Sampling Distribution` | توزيع إحصاءة محسوبة من عينات متعددة | توزيع متوسط الدخل لـ1000 عينة من 20 موظف |

**المبدأ المحوري:** توزيع العينة (`Sampling Distribution`) أكثر انتظاماً وأضيق من `Data Distribution`، وكلما كبر حجم العينة كلما ضاق توزيع الإحصاءة (الشكل 2-6).

**لماذا؟** هذا أساس **نظرية الحد المركزي (Central Limit Theorem)** — مجموع أو متوسط عدد كبير من المتغيرات يتبع التوزيع الطبيعي بصرف النظر عن التوزيع الأصلي.

#### 🤔 تفعيل الفهم (اسأل نفسك):
> **سؤال:** في الشكل 2-6: لماذا يضيق الهستوغرام كلما زاد n من 1 إلى 5 إلى 20؟
> **لماذا هذا مهم؟** لأن المتوسط يُلغي التقلبات الفردية — كلما أخذت متوسط أكثر، قلّ التشتت، وهذا أساس الثقة في التقديرات الإحصائية.

---

### 17. Standard Error — الخطأ المعياري

#### النص الأصلي يقول:
> "A key metric that sums up the variability of a sample statistic is its standard error. Do not confuse standard deviation (which measures the variability of individual data points) with standard error (which measures the variability of a sample metric)."

#### الشرح المبسّط:

#### 📐 المعادلة: Standard Error

$$
SE = \frac{s}{\sqrt{n}}
$$

**الشرح:**
> - $SE$ = الخطأ المعياري (`standard error`)
> - $s$ = الانحراف المعياري للعينة
> - $n$ = حجم العينة

**الفهم الخاطئ الشائع ❌:** الظن أن `Standard Deviation` و`Standard Error` شيء واحد.
**الفهم الصحيح ✅:** `SD` يقيس تشتّت نقاط البيانات الفردية | `SE` يقيس تشتّت الإحصاءة (المتوسط مثلاً) من عينة لأخرى.

---

### 18. The Bootstrap — أسلوب Bootstrap

#### النص الأصلي يقول:
> "One easy and effective way to estimate the sampling distribution of a statistic, or of model parameters, is to draw additional samples, with replacement, from the sample itself and recalculate the statistic or model for each resample. This procedure is called the bootstrap."

#### الشرح المبسّط:
**`Bootstrap`** هو أسلوب إحصائي ذكي: بدلاً من سحب عينات جديدة من المجتمع (مكلف أو مستحيل)، نُعيد أخذ العينات **من العينة نفسها** مع الإرجاع.

**المنطق:** نتخيّل أن عينتنا مُكرَّرة آلاف المرات لتُشكّل "مجتمعاً افتراضياً"، ثم نسحب منه عينات.

**المزايا:**
- لا يستلزم افتراض توزيع معين
- يعمل لأي إحصاءة (وسيط، انحدار، ارتباط...)
- لا يعتمد على `Central Limit Theorem`

#### ⚙️ الخطوات / الخوارزمية: Bootstrap لتقدير الخطأ المعياري للمتوسط

#### ما هدف هذه العملية؟
> تقدير `Standard Error` أو `Sampling Distribution` لأي إحصاءة بدون صيغة رياضية.

```algorithm
1 | حدد حجم العينة n | Setup | n = حجم العينة الأصلية
2 | اسحب n قيمة من العينة مع الإرجاع | Random Draw with Replacement | عينة Bootstrap جديدة
3 | احسب الإحصاءة (مثلاً المتوسط) | Statistic Calculation | سجّل النتيجة
4 | كرر الخطوتين 2-3 عدد R مرة | Loop | R يتراوح 500–10000
5 | اجمع R نتيجة | Collection | لديك الآن توزيع Bootstrap
6 | استخدم النتائج لـ: تقدير SE أو بناء Confidence Interval | Analysis | الخطأ المعياري = std(نتائج Bootstrap)
```

#### نقاط التنفيذ:
- السحب يكون **مع الإرجاع** — نفس القيمة قد تُختار أكثر من مرة
- R يجب أن يكون كبيراً (500 على الأقل، يُفضَّل 1000–10000)
- لا تُغيّر Bootstrap **التحيز** — إذا كانت العينة الأصلية متحيزة، Bootstrap لن يُصحّحه

#### 🤔 تفعيل الفهم (اسأل نفسك):
> **سؤال:** لماذا نسحب **مع الإرجاع** وليس بدونه؟
> **لماذا هذا مهم؟** السحب مع الإرجاع يحافظ على نفس الاحتمال في كل سحبة، مما يُحاكي أخذ عينة جديدة من مجتمع ضخم.

---

## الجزء الثاني: ملخص منظم

### أهم التعاريف والمفاهيم

| المصطلح | التعريف | مثال/ملاحظة |
| --- | --- | --- |
| `Histogram` | رسم يُظهر توزيع متغير رقمي عبر bins | خيار حجم الbin يؤثر على الشكل |
| `Density Plot (KDE)` | نسخة مُمَلَّسة من الhistogram | المساحة تحت المنحنى = 1 |
| `Bar Chart` | رسم للبيانات الفئوية | أعمدة متباعدة، محور x فئات |
| `Mode` | القيمة الأكثر تكراراً | للبيانات الفئوية أساساً |
| `Expected Value` | متوسط مرجّح بالاحتمالات | EV = Σ(x·P(x)) |
| `Correlation Coefficient` | يقيس قوة واتجاه العلاقة بين متغيرين | بين -1 و+1 |
| `Scatterplot` | رسم لإظهار علاقة متغيرين رقميين | كل نقطة = سجل |
| `Hexagonal Binning` | تجميع نقاط scatterplot في خلايا سداسية | لبيانات كثيفة |
| `Contingency Table` | جدول تقاطع متغيرين فئويين | أساس chi-square test |
| `Violin Plot` | دمج boxplot + density plot | يُظهر التوزيع كاملاً |
| `Conditioning/Faceting` | تقسيم رسم حسب متغير ثالث | facet_wrap في ggplot2 |
| `Population` | مجموعة البيانات الكاملة | قد تكون نظرية |
| `Sample` | مجموعة فرعية ممثّلة | أساس كل التحليل الإحصائي |
| `Bias` | خطأ منتظم في الاتجاه ذاته | لا يُصحَّح بزيادة العينة |
| `Random Sampling` | كل عنصر له فرصة متساوية | يُقلّل التحيز |
| `Sampling Distribution` | توزيع إحصاءة محسوبة من عينات متعددة | أضيق من data distribution |
| `Standard Error` | تشتّت الإحصاءة = SD/√n | ≠ Standard Deviation |
| `Bootstrap` | إعادة أخذ عينات من العينة نفسها مع الإرجاع | يُقدّر SE لأي إحصاءة |
| `Regression to the Mean` | القيم المتطرفة تعود للمتوسط | ≠ Linear Regression |

---

### المكونات الرئيسية (مرجع سريع)

| الأداة | الوظيفة | في R | في Python |
| --- | --- | --- | --- |
| `histogram` | توزيع متغير رقمي | `hist()` | `.plot.hist()` |
| `density plot` | توزيع مُمَلَّس | `density()` + `lines()` | `.plot.density()` |
| `bar chart` | توزيع بيانات فئوية | `barplot()` | `.plot.bar()` |
| `boxplot` | ملخص توزيع + outliers | `boxplot()` | `.boxplot()` |
| `violin plot` | boxplot + density | `geom_violin()` | `sns.violinplot()` |
| `scatterplot` | علاقة متغيرين | `plot()` | `.plot.scatter()` |
| `correlation` | قياس الارتباط | `cor()` | `.corr()` |
| `hexbin` | scatterplot كثيف | `stat_binhex()` | `plt.hexbin()` |
| `contour/KDE 2D` | كثافة ثنائية الأبعاد | `geom_density2d()` | `sns.kdeplot()` |
| `facet` | رسوم مشروطة | `facet_wrap()` | `sns.FacetGrid()` |

---

### جداول مقارنات سريعة

| | `Histogram` | `Bar Chart` |
| --- | --- | --- |
| نوع البيانات | رقمية مستمرة | فئوية |
| المحور x | قيم رقمية | فئات |
| الأعمدة | متلاصقة | متباعدة |
| الترتيب | مهم (رقمي) | غير إلزامي |

| | `Standard Deviation` | `Standard Error` |
| --- | --- | --- |
| ما يقيسه | تشتّت نقاط البيانات | تشتّت الإحصاءة بين العينات |
| الصيغة | $s$ | $s/\sqrt{n}$ |
| يكبر مع زيادة n؟ | لا | يصغر |
| متى نستخدمه | وصف البيانات | دقة التقدير |

| | `Pearson r` | `Spearman ρ` |
| --- | --- | --- |
| الأساس | القيم الفعلية | رتب البيانات |
| حساسية للـ`outliers` | عالية | منخفضة |
| يكتشف | علاقات خطية | أي علاقة رتبية |
| متى نستخدم | بيانات طبيعية | outliers أو لا خطية |

---

### أبرز النقاط الذهبية

1. الصناديق الفارغة في `histogram` معلومة — لا تحذفها.
2. `Density plot` المساحة تحته = 1، محوره y = كثافة لا عدد.
3. `mode` للفئوية؛ `mean/median` للرقمية.
4. `Expected Value` = Σ(قيمة × احتمالها).
5. ارتباط Pearson حساس للـ`outliers` — استخدم Spearman عند الشك.
6. `r = 0` لا يعني لا علاقة — قد توجد علاقة غير خطية.
7. التحيز لا يُصحَّح بزيادة حجم العينة.
8. `Standard Error = SD / √n` — يصغر بزيادة n.
9. `Bootstrap` يُقدّر توزيع العينة بدون افتراضات توزيعية.
10. `Regression to the Mean` ≠ `Linear Regression`.

---

### الأخطاء الشائعة عند الطلاب ⚠️

| الخطأ | التصحيح |
| --- | --- |
| الخلط بين `histogram` و`bar chart` | hist: رقمي متلاصق؛ bar: فئوي متباعد |
| ظن أن r=0 يعني لا علاقة | r يقيس العلاقة الخطية فقط |
| الخلط بين `SD` و`SE` | SD للبيانات، SE للإحصاءة |
| زيادة العينة لتصحيح التحيز | التحيز منهجي، الحجم لا يُصحّحه |
| استخدام `Pearson` مع outliers | استخدم `Spearman` بدلاً منه |
| ظن أن `Bootstrap` يُصحّح التحيز | Bootstrap يُقدّر SE فقط، لا يُصحّح التحيز |
| قراءة `density plot` بمحور y كعدد | محور y = كثافة، اقرأ المناطق لا النقاط |

---

### خطوات وإجراءات المحاضرة

#### ⚙️ الخطوات / الخوارزمية: Bootstrap لحساب Standard Error

#### ما هدف هذه العملية؟
> تقدير `SE` لأي إحصاءة من عينة واحدة فقط.

```algorithm
1 | ابدأ بعينة أصلية حجمها n | Initialize | n = حجم العينة
2 | اسحب n قيمة عشوائياً مع الإرجاع | Bootstrap Sample | نفس الحجم n
3 | احسب الإحصاءة (mean/median/...) | Compute Statistic | سجّل القيمة
4 | كرر 2-3 لـ R مرة (R ≥ 1000) | Repeat | لديك R قيمة
5 | احسب std(R قيمة) | Standard Error Estimate | SE_boot
6 | أو احسب percentiles(2.5%, 97.5%) | Confidence Interval | CI_boot
```

#### نقاط التنفيذ:
- `R` يجب أن يكون كبيراً — 1000 على الأقل
- الإحصاءة المدروسة يمكن أن تكون أي شيء: mean، median، correlation، regression coefficient
- Bootstrap لا يُصحّح التحيز في العينة الأصلية

---

### أنماط الأكواد والبنى المتكررة

| النمط | البنية الأساسية | متى تستخدمه |
| --- | --- | --- |
| `Histogram + Density` | `hist(freq=FALSE)` + `lines(density(...))` | استكشاف توزيع بيانات |
| `Side-by-side Boxplot` | `boxplot(y ~ group)` | مقارنة فئات متعددة |
| `Correlation Matrix` | `cor(df)` / `df.corr()` | استكشاف علاقات متعددة |
| `Faceted Plot` | `facet_wrap('var')` / `FacetGrid(col='var')` | التحليل المشروط |
| `Bootstrap Loop` | `replicate(R, mean(sample(..., replace=TRUE)))` | تقدير SE لأي إحصاءة |

---

## الجزء الثالث: أسئلة اختيار من متعدد (MCQ)

> **20 سؤالاً** — مستوى: medium/hard. التوزيع: مقارنات 20% | سيناريو كود 25% | تطبيق 35% | تتبع 20%.

---

### السؤال 1 (medium) — مقارنة
ما الفرق الجوهري بين `histogram` و`bar chart`؟

أ) `histogram` للبيانات الفئوية، `bar chart` للرقمية
ب) `histogram` للبيانات الرقمية المستمرة وأعمدته متلاصقة؛ `bar chart` للفئوية وأعمدته متباعدة
ج) لا فرق — كلاهما يُستخدم بنفس الطريقة
د) `bar chart` دائماً أكثر دقة من `histogram`

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خاطئ — العكس صحيح.
- ب) **صحيح** — التعريف الدقيق لكليهما.
- ج) خاطئ — الفرق جوهري في نوع البيانات والتمثيل.
- د) خاطئ — الدقة لا علاقة لها بنوع الرسم.

---

### السؤال 2 (medium) — تطبيق
ما معنى أن المساحة تحت `density plot` تساوي 1؟

أ) يعني أن جميع البيانات قيمتها 1
ب) يعني أن هناك بيانات واحدة فقط
ج) يعني أن المنحنى يُمثّل توزيعاً احتمالياً: المنطقة بين نقطتين = نسبة البيانات بينهما
د) يعني أن المتوسط يساوي 1

**الإجابة الصحيحة: ج**
**التعليل:**
- أ، ب، د) خاطئة — لا علاقة للقيمة 1 بالبيانات نفسها.
- ج) **صحيح** — المساحة = 1 تعني التوزيع الاحتمالي الكامل. المساحة بين a و b = P(a ≤ X ≤ b).

---

### السؤال 3 (hard) — سيناريو كود
ما الخطأ في الكود التالي إذا أردنا رسم `density plot` فوق `histogram` في Python؟

```python
state['Murder.Rate'].plot.hist(bins=10)
state['Murder.Rate'].plot.density()
```

أ) يجب استخدام `density=True` في الhistogram ونفس الـ`ax`
ب) لا خطأ — الكود صحيح
ج) يجب استخدام `seaborn` بدلاً من `pandas`
د) `density()` لا تعمل في Python

**الإجابة الصحيحة: أ**
**التعليل:**
- أ) **صحيح** — الكود سيُنشئ رسمين منفصلين. يجب: (1) `density=True` لتوحيد محور y، (2) `ax=ax` لإضافة الكثافة لنفس الرسم.
- ب) خاطئ — سيُنشئ رسمين منفصلين بمحورين y مختلفين.
- ج) خاطئ — pandas يدعم ذلك بشكل صحيح مع التعديلات.
- د) خاطئ — `.plot.density()` دالة صحيحة في pandas.

---

### السؤال 4 (medium) — تطبيق
شركة تبيع اشتراكات بثلاثة مستويات: \$100 (10%)، \$50 (30%)، \$0 (60%). ما القيمة المتوقعة؟

أ) \$50
ب) \$25
ج) \$10 + \$15 = \$25
د) \$150

**الإجابة الصحيحة: ج**
**التعليل:**
- ج) **صحيح** — EV = (0.10)(100) + (0.30)(50) + (0.60)(0) = 10 + 15 + 0 = \$25.
- أ) خاطئ — \$50 هو وسط النطاق لا القيمة المتوقعة.
- ب) خاطئ — \$25 صحيح لكن التفصيل في ج أوضح.
- د) خاطئ — مجموع الأسعار لا القيمة المتوقعة.

*(ملاحظة: الإجابتان ب وج تصلان لنفس الرقم لكن ج تُظهر الحساب الصحيح)*

---

### السؤال 5 (hard) — مقارنة
متى يُفضَّل استخدام `Spearman's rho` على `Pearson's r`؟

أ) عند الرغبة في نتائج أسرع
ب) عند وجود قيم شاذة (`outliers`) أو علاقة غير خطية
ج) عند البيانات ذات التوزيع الطبيعي
د) عند كبر حجم العينة

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خاطئ — السرعة ليست معيار الاختيار.
- ب) **صحيح** — `Spearman` يعمل على الرتب لا القيم، مما يجعله قوياً ضد outliers وقادراً على اكتشاف علاقات رتبية غير خطية.
- ج) خاطئ — `Pearson` هو الأنسب للبيانات الطبيعية.
- د) خاطئ — حجم العينة لا يُحدد الاختيار.

---

### السؤال 6 (hard) — سيناريو كود

#### السيناريو 1: Bootstrap في R
```r
# Bootstrap standard error for the mean
n <- 100
boot_means <- replicate(1000, mean(sample(data, n, replace=TRUE)))
se_boot <- sd(boot_means)
```

ما الذي يُحسبه `se_boot`؟

أ) الانحراف المعياري للبيانات الأصلية
ب) تقدير `Standard Error` للمتوسط عبر Bootstrap
ج) الخطأ التربيعي المتوسط
د) قيمة الوسيط

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خاطئ — الكود يعمل على 1000 **متوسط** لعينات Bootstrap، لا على البيانات مباشرة.
- ب) **صحيح** — `sd(boot_means)` = الانحراف المعياري لتوزيع المتوسطات = `Standard Error`.
- ج) خاطئ — لا يوجد `MSE` هنا.
- د) خاطئ — نحسب المتوسط `mean()` لا الوسيط.

---

### السؤال 7 (medium) — تطبيق
ما الفرق بين `Standard Deviation` و`Standard Error`؟

أ) لا فرق — كلاهما نفس الشيء
ب) `SD` يقيس تشتّت نقاط البيانات، `SE` يقيس تشتّت إحصاءة كالمتوسط بين عينات مختلفة
ج) `SE` يقيس تشتّت البيانات، `SD` يقيس تشتّت الإحصاءة
د) `SE` دائماً أكبر من `SD`

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خاطئ — فرق جوهري في التعريف والاستخدام.
- ب) **صحيح** — التعريف الدقيق. `SE = SD/√n`، يصغر بزيادة n.
- ج) خاطئ — العكس.
- د) خاطئ — `SE = SD/√n` ≤ `SD` دائماً عندما n ≥ 1.

---

### السؤال 8 (hard) — تطبيق
نجري دراسة ونأخذ عينة 400 شخص من مدينة معينة ونجد أن متوسط دخلهم \$60,000 مع SD = \$20,000. ما `Standard Error` للمتوسط؟

أ) \$20,000
ب) \$1,000
ج) \$50
د) \$500

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خاطئ — هذا الـ`SD`، لا الـ`SE`.
- ب) **صحيح** — `SE = 20,000 / √400 = 20,000 / 20 = 1,000`.
- ج، د) خاطئتان — حسابات خاطئة.

---

### السؤال 9 (medium) — مقارنة
لماذا يُفضَّل `bar chart` على `pie chart` في تصور البيانات؟

أ) `bar chart` أجمل بصرياً
ب) `pie chart` يُظهر بيانات أكثر
ج) `bar chart` أوضح في المقارنات — العين تُقارن الأطوال بدقة أكثر من الزوايا
د) `pie chart` أصعب في الحساب

**الإجابة الصحيحة: ج**
**التعليل:**
- أ) الجمال رأي شخصي، ليس معياراً علمياً.
- ب) خاطئ — كلاهما يُظهر نفس البيانات.
- ج) **صحيح** — علم الإدراك البصري يُثبت أن البشر يُقارنون الأطوال بدقة أكبر من مقارنة الزوايا أو المساحات.
- د) خاطئ — `pie chart` لا يتطلب حسابات.

---

### السؤال 10 (hard) — تطبيق
ما الفرق بين `Random Error` و`Bias` في أخذ العينات؟

أ) `Random Error` أخطر من `Bias`
ب) `Bias` خطأ منتظم يُصحَّح بزيادة العينة، `Random Error` عشوائي لا يُصحَّح
ج) `Random Error` عشوائي يتوزع حول القيمة الحقيقية ويُقلَّل بزيادة العينة؛ `Bias` منتظم ولا يُصحَّح بزيادة العينة
د) لا فرق بين الاثنين

**الإجابة الصحيحة: ج**
**التعليل:**
- أ) خاطئ — `Bias` غالباً أخطر لأنه لا يُصحَّح تلقائياً.
- ب) خاطئ — العكس: `Random Error` يُقلَّل بزيادة العينة، لكن `Bias` لا.
- ج) **صحيح** — التعريف الدقيق وفق الكتاب.
- د) خاطئ — فرق جوهري.

---

### السؤال 11 (medium) — سيناريو كود

#### السيناريو 2: Correlation Matrix
```r
library(corrplot)
cor_matrix <- cor(etf_returns)
corrplot(cor_matrix, method='ellipse')
```
ماذا تعني `ellipse` مائلة لأعلى اليسار باللون الأحمر الداكن؟

أ) ارتباط موجب قوي
ب) ارتباط سلبي قوي
ج) لا ارتباط
د) خطأ في البيانات

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خاطئ — موجب = مائل لأعلى اليمين + أزرق.
- ب) **صحيح** — مائل لأعلى اليسار = سلبي، داكن ورفيع = قوي.
- ج) خاطئ — عدم الارتباط = دائرة فاتحة.
- د) خاطئ — شكل صحيح في الرسم.

---

### السؤال 12 (hard) — تطبيق
ما معنى `Regression to the Mean` في سياق أداء الرياضيين؟

أ) يعني أن اللاعبين يتحسنون دائماً مع الوقت
ب) يعني أن اللاعب الذي أدى أفضل أداء في الجولة الأولى سيُؤدّي أداءً قريباً من المتوسط في الجولات التالية
ج) يعني أن متوسط الأداء ينخفض مع الوقت
د) يعني ارتباط الأداء الحالي بالأداء المستقبلي بشكل خطي

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خاطئ — `Regression to the Mean` لا يعني تحسناً مستمراً.
- ب) **صحيح** — الأداء المتطرف يتضمن عنصر حظ؛ في الجولة التالية الحظ يكون عشوائياً فيعود الأداء للمتوسط.
- ج) خاطئ — لا يعني انخفاضاً، بل تقارباً من المتوسط في الاتجاهين.
- د) خاطئ — `Regression to the Mean` ظاهرة إحصائية، لا نموذج انحدار.

---

### السؤال 13 (medium) — تطبيق
ما الفائدة من `Conditioning` في رسم `Scatterplot`؟

أ) تُسرّع رسم البيانات
ب) تُقلّل حجم البيانات
ج) تُتيح دراسة العلاقة بين متغيرين في ضوء متغير ثالث (مثل الموقع الجغرافي)
د) تُصحّح قيم الارتباط

**الإجابة الصحيحة: ج**
**التعليل:**
- أ، ب) خاطئتان — الغرض إدراكي/تحليلي لا حسابي.
- ج) **صحيح** — كما في مثال الكتاب: تقسيم العلاقة مساحة/قيمة حسب الرمز البريدي أظهر مجموعات كانت مخفية.
- د) خاطئ — `conditioning` لا يُغيّر قيم الارتباط.

---

### السؤال 14 (hard) — سيناريو كود

#### السيناريو 3: Bootstrap CI
بيانات: `[15, 22, 18, 30, 25]` — أخذنا 3 عينات Bootstrap وحسبنا المتوسط:
- Bootstrap 1: `[15, 15, 22, 25, 30]` → Mean = 21.4
- Bootstrap 2: `[22, 25, 18, 18, 22]` → Mean = 21.0
- Bootstrap 3: `[30, 15, 25, 22, 30]` → Mean = 24.4

ما `SE_bootstrap` التقريبي؟

أ) 0
ب) نحو 1.8
ج) نحو 22
د) نحو 9

**الإجابة الصحيحة: ب**
**التعليل:**
- الـ`SE_bootstrap` = std(21.4, 21.0, 24.4) = std(الانحراف عن المتوسط 22.27) ≈ 1.85
- ب) **صحيح** — القيمة حول 1.8.
- أ) خاطئ — لا تشتت صفري هنا.
- ج) خاطئ — 22 هو متوسط المتوسطات.
- د) خاطئ — 9 = نطاق البيانات الأصلية لا SE.

---

### السؤال 15 (medium) — مقارنة
ما الفرق بين `Sampling Distribution` و`Data Distribution`؟

أ) لا فرق
ب) `Sampling Distribution` أوسع دائماً من `Data Distribution`
ج) `Data Distribution` هي توزيع نقاط البيانات الفردية؛ `Sampling Distribution` هي توزيع إحصاءة (كالمتوسط) محسوبة من عينات متكررة
د) `Sampling Distribution` تُستخدم فقط مع `Bootstrap`

**الإجابة الصحيحة: ج**
**التعليل:**
- أ) خاطئ — فرق جوهري.
- ب) خاطئ — العكس عادةً: `Sampling Distribution` أضيق.
- ج) **صحيح** — التعريف الدقيق. `Sampling Distribution` تُظهر تقلب الإحصاءة بين عينات مختلفة.
- د) خاطئ — `Sampling Distribution` مفهوم عام، `Bootstrap` طريقة واحدة لتقديرها.

---

### السؤال 16 (hard) — تطبيق
ما الصواب بخصوص قيمة ارتباط r = 0.9؟

أ) يعني أن X يُسبّب Y
ب) يعني أن 90% من البيانات تتبع علاقة خطية
ج) يعني وجود ارتباط موجب قوي — عندما ترتفع X ترتفع Y في معظم الأحيان
د) يعني أن العلاقة مثالية وبلا استثناءات

**الإجابة الصحيحة: ج**
**التعليل:**
- أ) خاطئ — الارتباط لا يعني السببية (`Correlation ≠ Causation`).
- ب) خاطئ — 90% ليست تفسير r = 0.9. (r² = 0.81 يُفسَّر كنسبة تفسير في الانحدار).
- ج) **صحيح** — r = 0.9 يعني ارتباطاً موجباً قوياً جداً.
- د) خاطئ — r = +1 فقط هو الكامل.

---

### السؤال 17 (medium) — تطبيق
استطلاع أُجري على زوار موقع إلكتروني للتقييم (من يريد يُقيّم)، ما نوع التحيز المحتمل؟

أ) `Random Error`
ب) `Self-Selection Bias`
ج) `Measurement Bias`
د) لا يوجد تحيز

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خاطئ — ليس عشوائياً، بل منتظم.
- ب) **صحيح** — من يُقيّم اختار ذلك بنفسه — غالباً ذوو تجارب متطرفة، مما يُحيّز النتائج.
- ج) خاطئ — تحيز القياس يتعلق بأداة القياس.
- د) خاطئ — تحيز واضح.

---

### السؤال 18 (hard) — سيناريو كود

#### السيناريو 4: Violin vs Boxplot
نريد مقارنة توزيع مبيعات يومية بين 5 مناطق، نعلم أن المبيعات لها توزيع `bimodal` (قمتان) في بعض المناطق.

أي أسلوب تصور تختار؟

أ) `Histogram` واحد لكل منطقة
ب) `Boxplot` جنباً إلى جنب
ج) `Violin Plot` جنباً إلى جنب
د) `Scatterplot`

**الإجابة الصحيحة: ج**
**التعليل:**
- أ) خاطئ — Histograms تُصعّب المقارنة المتزامنة.
- ب) غير مثالي — `Boxplot` يُخفي شكل التوزيع الثنائي (`bimodal`).
- ج) **صحيح** — `Violin Plot` يُظهر شكل التوزيع كاملاً بما في ذلك القمم المتعددة، مع مقارنة متزامنة.
- د) خاطئ — Scatterplot لعلاقة متغيرين.

---

### السؤال 19 (hard) — تطبيق
ما الإجراء الصحيح لرسم Density Plot مع Histogram في Python بمحور y موحّد؟

أ) رسمهما في نافذتين منفصلتين
ب) استخدام `density=True` في histogram ثم إضافة `density()` بـ`ax=ax`
ج) تقسيم البيانات على أكبر قيمة قبل الرسم
د) استخدام `hist()` فقط دون `density()`

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خاطئ — لن يكونا مقارنَين.
- ب) **صحيح** — `density=True` يجعل الـy محوراً للكثافة، و`ax=ax` يضمن الرسم على نفس المحور.
- ج) خاطئ — يُشوّه البيانات.
- د) خاطئ — `density()` ضروري لإضافة المنحنى.

---

### السؤال 20 (hard) — تطبيق
ما الفرق بين `Hexagonal Binning` و`Contour Plot`؟

أ) لا فرق — كلاهما مكافئان تماماً
ب) `Hexagonal Binning` يستخدم ألوان خلايا سداسية لتمثيل الكثافة؛ `Contour Plot` يستخدم منحنيات مستوى (مثل خريطة التضاريس)
ج) `Hexagonal Binning` أسرع حسابياً دائماً
د) `Contour Plot` لا يُظهر الكثافة

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خاطئ — تمثيلات مختلفة رغم تقديم نفس المعلومة.
- ب) **صحيح** — تعريف دقيق لكليهما. `Hexbin` شبكة سداسية ملوّنة، `Contour` خطوط متساوية الكثافة.
- ج) خاطئ — السرعة ليست المعيار الرئيسي.
- د) خاطئ — `Contour Plot` يُظهر الكثافة بشكل خطوط.

---

## الجزء الرابع: أسئلة تصحيح الكود

---

### سؤال تصحيح 1 — `logic`

**الكود التالي يحتوي خطأ:**
```python
# Trying to overlay density on histogram
ax = state['Murder.Rate'].plot.hist(bins=10)
state['Murder.Rate'].plot.density()  # BUG HERE
ax.set_xlabel('Murder Rate')
```

**اكتشف الخطأ:** سيُنشئ الكود رسمين منفصلين ويُعطي نتائج لا معنى لها — الـ`histogram` بعدد (Count) والـ`density` بكثافة (Density)، بمقياسين مختلفين.

**التصحيح:**
```python
# Fix 1: Add density=True so y-axis is density not count
ax = state['Murder.Rate'].plot.hist(density=True, bins=10)
# Fix 2: Add ax=ax to plot on the same axes
state['Murder.Rate'].plot.density(ax=ax)
ax.set_xlabel('Murder Rate')
```

**شرح الحل:**
1. `density=True` يُحوّل المحور y من عدد إلى كثافة احتمالية.
2. `ax=ax` يضمن رسم المنحنى على نفس إطار الـ`histogram`.
3. بدون هذين التعديلين: محوران مختلفان، رسمان منفصلان.

---

### سؤال تصحيح 2 — `misconception`

**الكود التالي يحتوي خطأ منطقياً:**
```python
# Checking for correlation
r = df['height'].corr(df['weight'])
if r == 0:
    print("No relationship between height and weight")
```

**اكتشف الخطأ:** `r = 0` يعني لا ارتباط **خطي** فقط — قد تكون هناك علاقة قوية غير خطية.

**التصحيح:**
```python
# Correct interpretation
r = df['height'].corr(df['weight'])
if abs(r) < 0.1:
    print("No significant LINEAR relationship detected")
    print("Consider checking for non-linear relationships via scatterplot")
else:
    print(f"Correlation: {r:.2f}")
```

**شرح الحل:**
1. `r = 0` لا يعني "لا علاقة" — يعني "لا علاقة خطية".
2. دائماً ارسم `scatterplot` للتحقق البصري.
3. `Spearman` يُكشف العلاقات الرتبية غير الخطية.

---

### سؤال تصحيح 3 — `wrong_formula`

**الكود التالي يحتوي خطأ في الصيغة:**
```python
import numpy as np
# Calculating Standard Error
data = [12, 15, 18, 22, 25, 30, 28, 19, 21, 17]
SE = np.std(data)  # BUG: This is Standard Deviation not Standard Error
print(f"Standard Error: {SE}")
```

**اكتشف الخطأ:** `np.std(data)` يحسب الانحراف المعياري (`SD`) لا الخطأ المعياري (`SE`).

**التصحيح:**
```python
import numpy as np
data = [12, 15, 18, 22, 25, 30, 28, 19, 21, 17]
n = len(data)
SD = np.std(data, ddof=1)         # Sample standard deviation
SE = SD / np.sqrt(n)               # Standard Error = SD / sqrt(n)
print(f"Standard Deviation: {SD:.2f}")
print(f"Standard Error: {SE:.2f}")
```

**شرح الحل:**
1. `SE = SD / √n` — الخطأ المعياري يتناسب عكسياً مع جذر حجم العينة.
2. `ddof=1` يُعطي الانحراف المعياري للعينة (وليس المجتمع).
3. SE أصغر من SD بعامل √n.

---

### سؤال تصحيح 4 — `wrong_test_choice`

**الكود التالي يحتوي خطأ في اختيار أسلوب التحليل:**
```r
# Trying to understand distribution of categorical variable
hist(airline_data$carrier)  # BUG: carrier is categorical
```

**اكتشف الخطأ:** `hist()` للمتغيرات الرقمية — لا معنى لـ`histogram` لمتغير فئوي.

**التصحيح:**
```r
# Correct: Use bar chart for categorical data
barplot(table(airline_data$carrier),
        main="Flights by Carrier",
        xlab="Airline",
        ylab="Count")

# Or using ggplot2
library(ggplot2)
ggplot(airline_data, aes(x=carrier)) +
  geom_bar() +
  labs(x="Airline", y="Count")
```

**شرح الحل:**
1. `hist()` يتوقع متغيراً رقمياً — للفئوي يستخدم `barplot()`.
2. `table()` تحسب تكرارات كل فئة قبل الرسم.
3. `geom_bar()` في `ggplot2` أكثر مرونة.

---

### سؤال تصحيح 5 — `logic`

**الكود التالي يحتوي خطأ في Bootstrap:**
```r
# Bootstrap WITHOUT replacement - WRONG
n <- length(data)
boot_means <- replicate(1000, mean(sample(data, n, replace=FALSE)))
se_boot <- sd(boot_means)
```

**اكتشف الخطأ:** `replace=FALSE` يعيد نفس العينة الأصلية في كل مرة (بترتيب مختلف فقط) — المتوسط لن يتغير.

**التصحيح:**
```r
# Bootstrap WITH replacement - CORRECT
n <- length(data)
boot_means <- replicate(1000,
                        mean(sample(data, n, replace=TRUE)))  # Must be TRUE
se_boot <- sd(boot_means)
```

**شرح الحل:**
1. Bootstrap يعتمد جوهرياً على `replace=TRUE` — بدونها ستحصل دائماً على نفس العينة.
2. مع الإرجاع، قد تتكرر نفس القيمة وقد تغيب أخرى — هذا يُنوّع المتوسطات.
3. `sd(boot_means)` يُعطي `SE_bootstrap` فقط مع `replace=TRUE`.

---

### سؤال تصحيح 6 — `misconception`

**الكود التالي يحتوي خطأ في تفسير الارتباط:**
```python
r = sales.corr()['ad_spend']['revenue']
if r > 0.8:
    print("Increasing ad spend CAUSES increased revenue")
```

**اكتشف الخطأ:** الارتباط لا يعني السببية (`Correlation ≠ Causation`).

**التصحيح:**
```python
r = sales.corr()['ad_spend']['revenue']
if r > 0.8:
    print(f"Strong positive correlation (r={r:.2f}) between ad spend and revenue")
    print("WARNING: Correlation does not imply causation!")
    print("Consider: confounders, reverse causality, randomized experiments")
```

**شرح الحل:**
1. ارتفاع r لا يعني أن X يُسبّب Y — قد يكون العكس أو متغير ثالث خفي.
2. لإثبات السببية تحتاج لتجربة عشوائية (`A/B Test`).
3. الارتباط العالي قد يكون مصادفة في سياقات أخرى (`spurious correlation`).

---

## الجزء الخامس: تمارين إضافية (من إعداد الدليل للتدريب)

> **هذه تمارين إضافية من إعداد الدليل للتدريب** — ليست في المحاضرة الأصلية.

---

### تمرين 1: Expected Value — `metric_calculation`

**السيناريو / المطلوب:**
شركة تُنظّم دورات تدريبية. من بين المسجّلين:
- 20% يشترون الدورة الكاملة بـ\$200
- 35% يشترون حزمة أساسية بـ\$80
- 45% لا يشترون شيئاً

**المطلوب:**
1. احسب القيمة المتوقعة لكل مسجّل
2. إذا كان تكلفة الندوة \$35 للشخص، هل الاستثمار مربح؟

**نموذج الحل:**
1. `EV = (0.20)(200) + (0.35)(80) + (0.45)(0) = 40 + 28 + 0 = $68`
2. EV = \$68 > تكلفة \$35 → الاستثمار مربح بهامش \$33 للشخص.

---

### تمرين 2: Standard Error — `metric_calculation`

**السيناريو / المطلوب:**
بيانات: عينة 64 طالباً، متوسط درجاتهم = 75، SD = 16.

**المطلوب:**
1. احسب `Standard Error` للمتوسط
2. ماذا يعني ذلك؟

**نموذج الحل:**
```
SE = SD / √n = 16 / √64 = 16 / 8 = 2
```
**التفسير:** إذا أخذنا عينات متكررة من 64 طالباً، المتوسطات ستتباين بمقدار 2 درجة في المتوسط.

---

### تمرين 3: Histogram vs Density — `fill_gaps`

**السيناريو / المطلوب:**
أكمل الفراغات في الكود:

```python
# Complete the code to overlay density on histogram
ax = df['income'].plot.hist(_______, bins=20)  # (1)
df['income'].plot._______(ax=___)              # (2)
ax.set_xlabel('Annual Income')
```

**المطلوب:**
1. أكمل (1) و(2)

**نموذج الحل:**
```python
ax = df['income'].plot.hist(density=True, bins=20)  # (1): density=True
df['income'].plot.density(ax=ax)                      # (2): density, ax=ax
ax.set_xlabel('Annual Income')
```

---

### تمرين 4: Bootstrap SE — `scenario`

**السيناريو / المطلوب:**
لديك البيانات: `[8, 12, 15, 9, 11, 14, 10, 13]`

**المطلوب:**
1. اكتب كود R لحساب `Bootstrap SE` للوسيط (Median) بـ1000 إعادة

**نموذج الحل:**
```r
data <- c(8, 12, 15, 9, 11, 14, 10, 13)
n <- length(data)

# Bootstrap for median
boot_medians <- replicate(1000,
  median(sample(data, n, replace=TRUE))
)

se_boot <- sd(boot_medians)
cat("Bootstrap SE for Median:", se_boot, "\n")
```

---

### تمرين 5: اكتشف نوع التحيز — `scenario`

**السيناريو / المطلوب:**
لكل حالة، حدد نوع التحيز:

1. استطلاع يُجرى هاتفياً في ساعات العمل
2. قياس ضغط الدم في المستشفى فقط (المرضى المرتفع)
3. Yelp reviews

**نموذج الحل:**
1. **تحيز اختيار غير عشوائي** — من يرد في ساعات العمل؟ العاطلون أو المتقاعدون بشكل غير متناسب.
2. **تحيز العينة** — المرضى في المستشفى ليسوا عينة ممثلة للسكان العامين.
3. **Self-Selection Bias** — من يكتبون مراجعات يختارون ذلك بأنفسهم، وغالباً ذوو تجارب متطرفة.

---

### تمرين 6: Correlation Interpretation — `written_analysis`

**السيناريو / المطلوب:**
حسبت الارتباط بين درجة حرارة اليوم ومبيعات الآيسكريم: r = 0.92

**المطلوب:**
1. ما تفسير هذه القيمة؟
2. هل يعني أن الحرارة **تُسبّب** ارتفاع المبيعات؟
3. ما الذي ستفعله للتحقق من الشك؟

**نموذج الحل:**
1. r = 0.92 = ارتباط موجب قوي جداً — يُشير إلى أن مبيعات الآيسكريم ترتفع مع الحرارة.
2. لا — الارتباط لا يعني السببية. قد يكون: العطلات الصيفية متزامنة مع الحرارة والمبيعات، أو عوامل مُربِكة أخرى.
3. إجراء تجربة عشوائية (A/B Test)، أو تحليل السببية (Granger causality)، أو التحكم في المتغيرات المُربِكة.

---

## الجزء الخامس (تكملة): تمارين تحليل وتطبيق

---

### تمرين 1: Hexbin vs Scatterplot — `written_analysis`

**السيناريو:**
لديك بيانات 50,000 منزل: المساحة والقيمة.

**المطلوب:**
1. لماذا يُفشل `scatterplot` عادي هنا؟
2. ما البديل الأفضل ولماذا؟

**نموذج الحل:**
1. مع 50,000 نقطة سيحدث `overplotting` شديد — النقاط تُغطّي بعضها ولا يمكن رؤية الكثافة الحقيقية.
2. `Hexagonal Binning` أو `Contour Plot` — يُظهران كثافة البيانات بدلاً من النقاط الفردية، مما يُكشف عن البنية الكامنة.

---

### تمرين 2: Violin Plot Interpretation — `diagram_completion`

**السيناريو:**
رسم `Violin Plot` لتأخير رحلات 6 شركات طيران.

**المطلوب:**
1. شركة لها violin ضيق وطويل — ماذا يعني؟
2. شركة لها violin واسع في المنتصف — ماذا يعني؟

**نموذج الحل:**
1. `Violin ضيق وطويل` = معظم الرحلات إما في تأخر قليل جداً أو كبير جداً — توزيع ثنائي (`bimodal`) أو ذو ذيل طويل.
2. `Violin واسع في المنتصف` = معظم الرحلات في نطاق تأخر متوسط — توزيع طبيعي قريب.

---

### تمرين 3: Case Study — Sampling Bias — `case_study`

**السيناريو:**
شركة أرادت تقييم رضا عملائها فأرسلت استطلاعاً للعملاء عبر البريد الإلكتروني، وأجاب 15% فقط. أظهرت النتائج رضا 90%.

**المطلوب:**
1. ما نوع التحيز المحتمل؟
2. كيف تُصحّح المنهجية؟

**نموذج الحل:**
1. **Non-response Bias + Self-Selection Bias** — من يجيب على الاستطلاع ليس عشوائياً: غالباً من كانوا راضين جداً (ليشاركوا حماسهم) أو غير راضين جداً (ليشتكوا). الراضون بالحد الأدنى لا يجيبون.
2. التصحيح: اختيار عينة عشوائية مباشرة وإجراء مقابلات، أو تقديم حوافز للإجابة، أو استخدام بيانات السلوك الفعلي بدلاً من الاستطلاعات.

---

## الجزء السادس: تمارين تتبع التنفيذ

---

### تمرين تتبع 1: حساب Expected Value خطوة بخطوة

**المدخل:**
```text
احتمالات النتائج:
- النتيجة A: $500 باحتمال 10%
- النتيجة B: $100 باحتمال 40%
- النتيجة C: $0 باحتمال 50%
```

**تتبّع خطوة بخطوة (أكمل الجدول):**

| الخطوة | العملية | الحالة |
| --- | --- | --- |
| 1 | اضرب النتيجة A × احتمالها | ؟ |
| 2 | اضرب النتيجة B × احتمالها | ؟ |
| 3 | اضرب النتيجة C × احتمالها | ؟ |
| 4 | اجمع النتائج الثلاثة | ؟ |

**نموذج الحل:**

| الخطوة | العملية | الحالة |
| --- | --- | --- |
| 1 | 500 × 0.10 | \$50 |
| 2 | 100 × 0.40 | \$40 |
| 3 | 0 × 0.50 | \$0 |
| 4 | 50 + 40 + 0 | **\$90** |

**النتيجة:** EV = \$90

---

### تمرين تتبع 2: Bootstrap خطوة بخطوة

**المدخل:**
```text
العينة الأصلية: [4, 7, 2, 9, 5]  (n=5)
أخذ 3 عينات Bootstrap وحساب المتوسط
```

**تتبّع خطوة بخطوة (أكمل الجدول):**

| Bootstrap # | العينة المسحوبة (مع الإرجاع) | المتوسط |
| --- | --- | --- |
| 1 | [4, 4, 7, 9, 5] | ؟ |
| 2 | [2, 2, 9, 9, 7] | ؟ |
| 3 | [5, 7, 4, 2, 4] | ؟ |
| SE_bootstrap | std(المتوسطات) | ؟ |

**نموذج الحل:**

| Bootstrap # | العينة المسحوبة | المتوسط |
| --- | --- | --- |
| 1 | [4, 4, 7, 9, 5] | 5.8 |
| 2 | [2, 2, 9, 9, 7] | 5.8 |
| 3 | [5, 7, 4, 2, 4] | 4.4 |
| SE_bootstrap | std(5.8, 5.8, 4.4) | ≈ 0.81 |

**النتيجة:** SE_bootstrap ≈ 0.81 (تقدير تقريبي من 3 عينات — يحتاج 1000+ للدقة)

---

### تمرين تتبع 3: Standard Error عبر n مختلف

**المدخل:**
```text
البيانات: SD = 30
أحسب SE لأحجام عينة مختلفة
```

**تتبّع خطوة بخطوة (أكمل الجدول):**

| حجم العينة n | الصيغة | SE |
| --- | --- | --- |
| 9 | 30 / √9 | ؟ |
| 25 | 30 / √25 | ؟ |
| 100 | 30 / √100 | ؟ |
| 900 | 30 / √900 | ؟ |

**نموذج الحل:**

| حجم العينة n | الصيغة | SE |
| --- | --- | --- |
| 9 | 30 / 3 | **10** |
| 25 | 30 / 5 | **6** |
| 100 | 30 / 10 | **3** |
| 900 | 30 / 30 | **1** |

**النتيجة:** مضاعفة n بـ100 يُقلّل SE بعشرة مرات.

---

### تمرين تتبع 4: Histogram Bin Size Effect

**المدخل:**
```text
بيانات: أعمار 10 أشخاص: [22, 23, 25, 28, 30, 31, 35, 38, 40, 45]
ارسم histogram بـ:
(أ) 2 bins  (ب) 5 bins  (ج) 10 bins
```

**تتبّع خطوة بخطوة (أكمل الجدول):**

| الـBin | نطاق (2 bins) | عدد | نطاق (5 bins) | عدد |
| --- | --- | --- | --- | --- |
| 1 | 22–33 | ؟ | 22–27 | ؟ |
| 2 | 33–45 | ؟ | 27–32 | ؟ |
| 3 | — | — | 32–37 | ؟ |
| 4 | — | — | 37–42 | ؟ |
| 5 | — | — | 42–46 | ؟ |

**نموذج الحل:**

| الـBin | نطاق (2 bins) | عدد | نطاق (5 bins) | عدد |
| --- | --- | --- | --- | --- |
| 1 | 22–33 | 6 | 22–27 | 3 |
| 2 | 33–45 | 4 | 27–32 | 3 |
| 3 | — | — | 32–37 | 2 |
| 4 | — | — | 37–42 | 1 |
| 5 | — | — | 42–46 | 1 |

**النتيجة:** 2 bins يُخفي الانتشار؛ 5 bins يُظهر نمطاً معقولاً.

---

## الجزء السابع: أسئلة نظرية متوقعة بالامتحان

---

### السؤال 1: ما الهستوغرام؟ وما أهميته في EDA؟
**نموذج الإجابة:**
1. **التعريف:** `histogram` رسم بياني يُقسّم البيانات الرقمية إلى bins ويعرض عدد القيم في كل bin.
2. **المكونات:** المحور x (قيم رقمية)، المحور y (عدد أو تكرار)، bins متساوية العرض، أعمدة متلاصقة.
3. **مثال:** `hist(state[['Population']], breaks=breaks)` في R.
4. **متى نستخدمه:** عند الرغبة في فهم شكل توزيع متغير رقمي، الانحراف، الكرتوزية، أو القيم الشاذة.

---

### السؤال 2: ما الفرق بين Histogram وDensity Plot؟
**نموذج الإجابة:**
1. **التعريف:** كلاهما يصف توزيع متغير رقمي.
2. **الفرق:** `Histogram` يعرض أعداداً في bins؛ `Density Plot` خط مستمر يُمثّل الكثافة الاحتمالية. المساحة تحت `Density Plot` = 1.
3. **مثال:** `hist(freq=FALSE)` + `lines(density(...))` في R.
4. **متى نستخدمه:** `Density Plot` عند الرغبة في مقارنة توزيعات أو تقدير `P(a ≤ X ≤ b)`.

---

### السؤال 3: ما Expected Value؟ وكيف تُحسبها؟
**نموذج الإجابة:**
1. **التعريف:** متوسط مرجّح تكون فيه الأوزان احتمالات كل نتيجة.
2. **الصيغة:** `EV = Σ(x_i × P(x_i))`.
3. **مثال:** \$300 بـ5% + \$50 بـ15% + \$0 بـ80% = \$22.50.
4. **متى نستخدمه:** في قرارات تجارية، تسعير، تقييم مشاريع — عند وجود نتائج محتملة بمعطيات احتمالاتها.

---

### السؤال 4: ما Pearson Correlation Coefficient؟ وما حدوده؟
**نموذج الإجابة:**
1. **التعريف:** مقياس قوة واتجاه العلاقة الخطية بين متغيرين.
2. **الصيغة:** `r = Cov(X,Y) / (SD_X × SD_Y)`.
3. **الحدود:** بين -1 (ارتباط سلبي تام) و+1 (ارتباط موجب تام)، 0 = لا ارتباط خطي.
4. **متى نستخدمه:** استكشاف العلاقات بين المتغيرات الرقمية — تحذير: حساس للـ`outliers`.

---

### السؤال 5: ما Sampling Distribution؟ ولماذا هي مختلفة عن Data Distribution؟
**نموذج الإجابة:**
1. **التعريف:** توزيع إحصاءة (كالمتوسط) محسوبة من عينات متكررة.
2. **الفرق:** `Data Distribution` توزيع القيم الفردية؛ `Sampling Distribution` توزيع إحصاءة.
3. **مثال:** توزيع دخل الأفراد مقابل توزيع متوسط الدخل من عينات متكررة.
4. **متى نستخدمه:** لتقدير دقة الإحصاءات، بناء `Confidence Intervals`، اختبار الفرضيات.

---

### السؤال 6: ما Bootstrap؟ وما مزاياه؟
**نموذج الإجابة:**
1. **التعريف:** أسلوب إحصائي يُعيد أخذ عينات من العينة نفسها مع الإرجاع لتقدير `Sampling Distribution`.
2. **الخطوات:** سحب n قيمة مع الإرجاع → حساب الإحصاءة → تكرار R مرة → std(النتائج) = SE.
3. **مثال:** `replicate(1000, mean(sample(data, n, replace=TRUE)))`.
4. **متى نستخدمه:** عندما لا تتوافر صيغة تحليلية للـ`SE`، أو عند عدم الرغبة في الافتراض الطبيعي.

---

### السؤال 7: ما الفرق بين Bias وRandom Error؟
**نموذج الإجابة:**
1. **التعريف:** كلاهما نوع من أخطاء القياس/أخذ العينات.
2. **الفرق:** `Random Error` عشوائي يتوزع حول القيمة الحقيقية ويُقلَّل بزيادة n؛ `Bias` منتظم لا يُصحَّح بزيادة n.
3. **مثال:** بندقية تُصيب حول المركز (Random Error) مقابل بندقية منحازة لربع معين (Bias).
4. **متى يكون خطيراً:** `Bias` أخطر في القرارات المبنية على البيانات لأنه غير مرئي وغير قابل للتصحيح بالحجم.

---

### السؤال 8: ما الفرق بين Standard Deviation وStandard Error؟
**نموذج الإجابة:**
1. **التعريف:** كلاهما يقيس تشتتاً، لكن لشيئين مختلفين.
2. **الفرق:** `SD` يقيس تشتّت نقاط البيانات؛ `SE = SD/√n` يقيس تشتّت إحصاءة كالمتوسط.
3. **مثال:** SD = 20 نقطة، n = 100 → SE = 2 نقطة.
4. **متى نستخدمه:** `SD` لوصف البيانات؛ `SE` للتحدث عن دقة التقدير.

---

### السؤال 9: ما Regression to the Mean؟ وكيف يُفرَّق عن Linear Regression؟
**نموذج الإجابة:**
1. **التعريف:** ظاهرة إحصائية تقول القيم المتطرفة في قياس تميل للعودة للمتوسط في القياس التالي.
2. **الفرق عن Linear Regression:** `Regression to the Mean` ظاهرة إحصائية طبيعية؛ `Linear Regression` نموذج تنبؤي رياضي.
3. **مثال:** دراسة جالتون — أطول الآباء ينجبون أبناء أطول لكن أقصر من آبائهم.
4. **متى يهم:** تفسير تحسن الأداء بعد تدخل — هل هو تأثير التدخل أم مجرد `Regression to the Mean`؟

---

### السؤال 10: ما Mode؟ ومتى نستخدمه بدلاً من Mean أو Median؟
**نموذج الإجابة:**
1. **التعريف:** القيمة (أو القيم) الأكثر تكراراً في البيانات.
2. **المقارنة:** `Mean` للبيانات الرقمية الطبيعية؛ `Median` للبيانات ذات outliers؛ `Mode` للبيانات الفئوية.
3. **مثال:** Mode لسبب التأخير في مطار Dallas = "Inbound".
4. **متى نستخدمه:** للبيانات الفئوية أساساً — للبيانات الرقمية المستمرة نادراً يُفيد.

---

### السؤال 11: ما Contingency Table؟ وما استخدامها؟
**نموذج الإجابة:**
1. **التعريف:** جدول يعرض توزيع العناصر حسب تقاطع متغيرين فئويين.
2. **المكونات:** صفوف = فئات المتغير الأول؛ أعمدة = فئات المتغير الثاني؛ خلايا = تكرارات.
3. **مثال:** درجة القرض (A-G) × نتيجة القرض (مسدَّد/متأخر).
4. **متى نستخدمه:** استكشاف العلاقة بين متغيرين فئويين — أساس اختبار `chi-square`.

---

### السؤال 12: ما Conditioning في رسم البيانات؟ ومتى نستخدمه؟
**نموذج الإجابة:**
1. **التعريف:** تقسيم رسم بياني حسب قيمة متغير ثالث لفهم العلاقة بشكل مشروط.
2. **الأدوات:** `facet_wrap()` في `ggplot2`؛ `FacetGrid` في `seaborn`.
3. **مثال:** رسم مساحة/قيمة منازل مقسَّم حسب الرمز البريدي.
4. **متى نستخدمه:** عند الاشتباه في أن متغيراً ثالثاً يُفسّر أنماطاً غريبة في الرسم الكلي.

---

## الجزء الثامن: الكود النهائي (مرجع شامل)

> الكود الكامل مجمّع من جميع أجزاء المحاضرة في ملفين منفصلين.

### script.R

```r
# === script.R ===
# Applied Statistics for Data Science — EDA & Sampling

# --- Histogram ---
hist(state[['Population']], breaks=breaks)

# --- Density Plot ---
hist(state[['Murder.Rate']], freq=FALSE)
lines(density(state[['Murder.Rate']]), lwd=3, col='blue')

# --- Bar Chart ---
barplot(table(airline_delays$cause), xlab="Cause of Delay", ylab="Count")

# --- Correlation ---
cor(telecom$T, telecom$VZ)                    # Pearson
library(robust)
covRob(telecom[, c('T', 'VZ')])               # Robust correlation

# --- Scatterplot ---
plot(telecom$T, telecom$VZ, xlab='ATT (T)', ylab='Verizon (VZ)')

# --- Side-by-side Boxplot ---
boxplot(pct_carrier_delay ~ airline, data=airline_stats, ylim=c(0, 50))

# --- Faceted Hexbin Plot ---
library(ggplot2)
ggplot(subset(kc_tax0, ZipCode %in% c(98188, 98105, 98108, 98126)),
       aes(x=SqFtTotLiving, y=TaxAssessedValue)) +
  stat_binhex(color='white') +
  theme_bw() +
  scale_fill_gradient(low='white', high='blue') +
  labs(x='Finished Square Feet', y='Tax-Assessed Value') +
  facet_wrap('ZipCode')

# --- Bootstrap SE ---
n <- length(data)
boot_means <- replicate(1000, mean(sample(data, n, replace=TRUE)))
se_boot <- sd(boot_means)
cat("Bootstrap SE:", se_boot)
```

### script.py

```python
# === script.py ===
# Applied Statistics for Data Science — EDA & Sampling
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# --- Histogram ---
ax = (state['Population'] / 1_000_000).plot.hist(figsize=(4, 4))
ax.set_xlabel('Population (millions)')

# --- Density Plot overlay ---
ax = state['Murder.Rate'].plot.hist(density=True, xlim=[0,12], bins=range(1,12))
state['Murder.Rate'].plot.density(ax=ax)
ax.set_xlabel('Murder Rate (per 100,000)')

# --- Correlation ---
telecom[['T', 'VZ']].corr()                        # Pearson
telecom[['T', 'VZ']].corr(method='spearman')       # Spearman

# --- Scatterplot ---
ax = telecom.plot.scatter(x='T', y='VZ', figsize=(4, 4), marker='$\u25EF$')
ax.set_xlabel('ATT (T)')
ax.set_ylabel('Verizon (VZ)')
ax.axhline(0, color='grey', lw=1)
ax.axvline(0, color='grey', lw=1)

# --- Side-by-side Boxplot ---
ax = airline_stats.boxplot(by='airline', column='pct_carrier_delay')
ax.set_ylabel('Daily % of Delayed Flights')
plt.suptitle('')

# --- Violin Plot ---
ax = airline_stats.boxplot(by='airline', column='pct_carrier_delay')
# Or with seaborn:
# sns.violinplot(data=airline_stats, x='airline', y='pct_carrier_delay')

# --- Faceted Hexbin ---
g = sns.FacetGrid(kc_tax0[kc_tax0.ZipCode.isin([98105, 98108, 98126, 98188])],
                  col='ZipCode', col_wrap=2)
g.map(plt.hexbin, 'SqFtTotLiving', 'TaxAssessedValue',
      gridsize=30, mincnt=1, cmap='Blues_r')

# --- Contour Plot ---
ax = sns.kdeplot(kc_tax0.SqFtTotLiving, kc_tax0.TaxAssessedValue)
ax.set_xlabel('Finished Square Feet')
ax.set_ylabel('Tax-Assessed Value')

# --- Bootstrap SE ---
def bootstrap_se(data, stat_func=np.mean, R=1000):
    n = len(data)
    boot_stats = [stat_func(np.random.choice(data, n, replace=True)) for _ in range(R)]
    return np.std(boot_stats)

se = bootstrap_se(np.array(data))
print(f"Bootstrap SE: {se:.4f}")
```

---

## الجزء التاسع: ورقة المراجعة السريعة (Cheat Sheet)

---

### 🔑 خريطة العلاقات بين المحاضرات

| المحاضرة | ترتبط مع | كيف؟ |
| --- | --- | --- |
| EDA (هذه المحاضرة) | الاختبارات الإحصائية | تكتشف EDA الأنماط التي تُولّد الفرضيات |
| EDA | الانحدار | scatterplot + correlation أولى خطوات نمذجة الانحدار |
| أخذ العينات (هذه المحاضرة) | Confidence Intervals | SE هو أساس بناء CI |
| Bootstrap | أي اختبار إحصائي | بديل لأي صيغة تحليلية غير متوفرة |

---

### 🔑 أهم النقاط الذهبية

| الموضوع | النقاط |
| --- | --- |
| Histogram | Bins فارغة تُبقَى؛ حجم الbin يؤثر على الشكل |
| Density Plot | مساحة تحت المنحنى = 1؛ y = كثافة لا عدد |
| Correlation | r ∈ [-1, +1]؛ r=0 لا يعني لا علاقة غير خطية |
| Bootstrap | مع الإرجاع؛ R ≥ 1000؛ لا يُصحّح التحيز |
| Bias | لا يُصحّح بزيادة العينة |
| SE | = SD/√n؛ يصغر بزيادة n |
| EV | = Σ(x × P(x)) |

---

### 🔑 مرجع سريع

| الرمز/المصطلح | المعنى | يُستخدم في |
| --- | --- | --- |
| `r` | Pearson correlation coefficient | قياس الارتباط الخطي |
| `EV` | Expected Value | قرارات مالية، احتمالات |
| `SE` | Standard Error = SD/√n | دقة التقديرات |
| `KDE` | Kernel Density Estimate | density plot |
| `SD` | Standard Deviation | تشتّت البيانات |
| `n` | حجم العينة | كل الحسابات |
| `R` | عدد تكرارات Bootstrap | 1000+ للدقة |
| `ρ` | Spearman's rho | ارتباط قوي ضد outliers |

---

### 🔑 قواعد ذهبية لا تُنسى

| # | القاعدة |
| --- | --- |
| 1 | Histogram = رقمي متلاصق؛ Bar Chart = فئوي متباعد |
| 2 | Density Plot: مساحة تحت المنحنى = 1 دائماً |
| 3 | r = 0 لا يعني لا علاقة (قد تكون غير خطية) |
| 4 | الارتباط لا يعني السببية |
| 5 | Bias لا يُصحَّح بزيادة حجم العينة |
| 6 | SE = SD / √n — يصغر بزيادة n |
| 7 | Bootstrap: السحب يكون مع الإرجاع دائماً |
| 8 | EV = Σ(قيمة × احتمالها) |
| 9 | Regression to the Mean ≠ Linear Regression |
| 10 | لا تُقارن SD وSE — يقيسان شيئين مختلفين |

---

## الجزء العاشر: بطاقات Q&A

**Q1:** ما الفرق بين Histogram وBar Chart؟
**A:** Histogram: رقمي مستمر، أعمدة متلاصقة؛ Bar Chart: فئوي، أعمدة متباعدة.

---

**Q2:** ما معنى أن المساحة تحت Density Plot = 1؟
**A:** يُمثّل توزيعاً احتمالياً — المنطقة بين نقطتين = نسبة البيانات بينهما.

---

**Q3:** كيف تحسب Expected Value؟
**A:** EV = Σ(x_i × P(x_i)) — اضرب كل نتيجة باحتمالها ثم اجمع.

---

**Q4:** ما الفرق بين Standard Deviation وStandard Error؟
**A:** SD يقيس تشتّت البيانات؛ SE = SD/√n يقيس تشتّت الإحصاءة بين العينات.

---

**Q5:** متى تستخدم Spearman بدلاً من Pearson؟
**A:** عند وجود outliers أو علاقة غير خطية.

---

**Q6:** ما Bootstrap؟
**A:** إعادة أخذ عينات من العينة نفسها مع الإرجاع لتقدير SE أو CI.

---

**Q7:** هل يمكن تصحيح Bias بزيادة حجم العينة؟
**A:** لا — Bias منتظم ولا يُصحَّح بزيادة الحجم.

---

**Q8:** ما Statistical Moments الأربعة؟
**A:** الأول: Location؛ الثاني: Variability؛ الثالث: Skewness؛ الرابع: Kurtosis.

---

**Q9:** ماذا يعني r = -0.8؟
**A:** ارتباط سلبي قوي — عندما يرتفع X ينخفض Y في معظم الحالات.

---

**Q10:** ما الفرق بين Population وSample؟
**A:** Population: مجموعة البيانات الكاملة؛ Sample: مجموعة فرعية منتقاة.

---

**Q11:** لماذا نُدرج الـbins الفارغة في Histogram؟
**A:** لأن غياب البيانات في نطاق ما معلومة مهمة — حذفها يُشوّه التوزيع.

---

**Q12:** ما Self-Selection Bias؟
**A:** تحيز ناتج عن أن الأفراد يختارون أنفسهم للمشاركة بدلاً من الاختيار العشوائي.

---

**Q13:** ما Regression to the Mean؟
**A:** القيم المتطرفة في قياس تميل للعودة نحو المتوسط في القياسات التالية.

---

**Q14:** ما Hexagonal Binning؟
**A:** تقسيم منطقة الـScatterplot إلى خلايا سداسية يلوَّن كل منها بحسب عدد النقاط فيه — لبيانات كثيفة.

---

**Q15:** ما الـ`ax` argument في Python عند رسم مخططات متداخلة؟
**A:** يُحدد إطار الرسم — بدونه ستُنشئ كل دالة رسماً منفصلاً.

---

**Q16:** ما Contingency Table؟
**A:** جدول يُلخّص تكرارات تقاطع فئتين من متغيرين فئويين — أساس chi-square test.

---

**Q17:** ما الـKDE (Kernel Density Estimate)؟
**A:** خوارزمية تحسب Density Plot بتمهيد البيانات باستخدام "نافذة" حول كل نقطة.

---

**Q18:** لماذا Bootstrap يسحب مع الإرجاع؟
**A:** لمحاكاة أخذ عينة جديدة من مجتمع افتراضي — بدون الإرجاع ستبقى العينة ثابتة.

---

**Q19:** ما Violin Plot؟
**A:** دمج Boxplot (الوسيط والربيعيات) + Density Plot (شكل التوزيع الكامل).

---

**Q20:** ما Conditioning في رسم البيانات؟
**A:** تقسيم الرسم حسب قيمة متغير ثالث (faceting) لدراسة العلاقات في ضوء متغير إضافي.

---

## الجزء الحادي عشر: قائمة فحص ذاتي قبل الامتحان ✅

- [ ] أستطيع رسم Histogram مع ضبط bin size في R وPython
- [ ] أفهم الفرق بين Histogram وBar Chart وأعرف متى أستخدم كلاً منهما
- [ ] أستطيع إضافة Density Plot فوق Histogram بمحور y موحّد
- [ ] أعرف الفرق بين Skewness وKurtosis وكيف أكتشفهما بصرياً
- [ ] أستطيع حساب Expected Value خطوة بخطوة
- [ ] أفهم Pearson Correlation وأعرف حدوده (-1 إلى +1)
- [ ] أعرف متى أستخدم Spearman بدلاً من Pearson
- [ ] أستطيع رسم Scatterplot وأعلم كيف أحسّن التصور عند البيانات الكثيفة
- [ ] أفهم Hexagonal Binning وContour Plot كبدائل للـScatterplot
- [ ] أعرف ما Contingency Table وكيف أُنشئها
- [ ] أفهم الفرق بين Boxplot وViolin Plot وأعرف مزايا كل منهما
- [ ] أفهم ما Conditioning/Faceting وأستطيع تطبيقه في R وPython
- [ ] أُفرّق بين Population وSample وSimple Random Sample
- [ ] أعرف أن Bias لا يُصحَّح بزيادة حجم العينة
- [ ] أفهم ما Sampling Distribution وكيف تختلف عن Data Distribution
- [ ] أعرف صيغة Standard Error: SE = SD/√n
- [ ] أُفرّق بين Standard Deviation وStandard Error
- [ ] أستطيع تنفيذ Bootstrap في R وPython لحساب SE
- [ ] أعرف أن Bootstrap يسحب مع الإرجاع وأفهم لماذا
- [ ] أفهم Regression to the Mean وأُميّزه عن Linear Regression

---

<!-- VALIDATION
lecture_type: EDA + Data and Sampling Distributions
chapters_covered: Ch1 (p.23-45), Ch2 (p.48-62)
sections_covered: 18
mcq_count: 20
debug_count: 6
exercise_count: 6
analysis_exercise_count: 3
trace_exercise_count: 4
theory_count: 12
qa_cards_count: 20
checklist_items: 20
golden_rules: 10
comparison_tables: 5
algorithm_blocks: 2
code_blocks_R: 8
code_blocks_Python: 8
all_lecture_content_covered: true
histogram_covered: true
density_plot_covered: true
bar_chart_covered: true
expected_value_covered: true
correlation_covered: true
scatterplot_covered: true
hexbin_contour_covered: true
contingency_table_covered: true
violin_plot_covered: true
conditioning_covered: true
sampling_bias_covered: true
bootstrap_covered: true
standard_error_covered: true
regression_to_mean_covered: true
schema_version: 1.0
-->
