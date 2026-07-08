# المحاضرة 3 — Statistical Machine Learning: Decision Trees (أشجار القرار للتصنيف)
> **المادة:** الاحصاء التطبيقي لعلم البيانات (القسم النظري) | **الموضوع:** بناء نموذج تصنيف باستخدام `decision tree` وخوارزمية `TDIDT` (Top-Down Induction of Decision Trees)

---

## 📌 خريطة التكامل (أين تقع هذه المحاضرة في الدورة؟)

| المرحلة | الأدوات | المخرجات |
| --- | --- | --- |
| Exploratory Data Analysis | `summary statistics`، `boxplots` | فهم توزيع البيانات |
| Data and Sampling Distributions | `bootstrap`، `confidence intervals` | تقدير عدم اليقين |
| Statistical Machine Learning ← **أنت هنا** | `decision trees`، `TDIDT`، `k-NN` | نموذج تصنيف قابل للتفسير (`interpretable model`) |
| Unsupervised Learning | `PCA`، `K-means` | اكتشاف أنماط بلا تصنيف مسبق |

> **نوع هذه المحاضرة:** `Statistical Machine Learning` — تصنيف (`Classification`) عبر تمثيل شجري، مع التركيز على خوارزمية `TDIDT` الأساسية (اختيار الصفة نفسه مؤجَّل للفصل 4 و5).

---

## الجزء الأول: الشرح التفصيلي (سطر بسطر / فقرة بفقرة)

### 1. مقدمة: لماذا أشجار القرار؟

#### النص الأصلي يقول:
> "In this chapter we look at a widely-used method of constructing a model from a dataset in the form of a decision tree or (equivalently) a set of decision rules... this representation of the data has the advantage compared with other approaches of being meaningful and easy to interpret."

#### الشرح المبسّط:
شجرة القرار (`decision tree`) هي طريقة لتحويل مجموعة بيانات (`dataset`) إلى نموذج تصنيف على شكل شجرة، وهذه الشجرة تُكافئ (equivalent) مجموعة من قواعد القرار (`decision rules`). أهم ميزة: النموذج **مفهوم للإنسان** ويمكن قراءته مباشرة، بعكس نماذج أخرى (مثل الشبكات العصبية) تُعامل كصندوق أسود (`black box`).

**لماذا؟** لأن اتخاذ القرار الآلي في مجالات حساسة (طبية، مالية) يحتاج تفسيرًا يفهمه البشر، لا مجرد رقم تنبؤ.

#### 💡 التشبيه:
> تخيّل موظف استقبال في عيادة يسألك سلسلة أسئلة (هل عندك حرارة؟ هل عندك سعال؟) وينتهي بقرار "راجع الطبيب" أو "استرح في المنزل".
> **وجه الشبه:** كل سؤال = عقدة داخلية (`internal node`)، والقرار النهائي = عقدة ورقة (`leaf node`).

### 2. خلفية تاريخية: القواعد المُستنبَطة آليًا مقابل أنظمة الخبرة

#### النص الأصلي يقول:
> "The British academic Donald Michie reported two large applications of 2,800 and 30,000+ rules, developed using automatic techniques in only one and man-years, respectively, compared with the estimated 100 and 180 man-years needed to develop the celebrated 'conventional' Expert Systems MYCIN and XCON."

#### الشرح المبسّط:
بدلاً من استخراج القواعد يدويًا من خبراء (`Expert System` التقليدي، مثل `MYCIN` و`XCON`) وهو عمل يستغرق عشرات سنوات-العمل (`man-years`)، يمكن توليد آلاف القواعد آليًا من البيانات في وقت أقصر بكثير.

**لماذا؟** لأن البيانات (`data`) أصبحت متوفرة بكثرة (حتى لو جُمعت لأغراض أخرى)، فاستغلالها لتوليد القواعد أرخص وأسرع من استشارة الخبراء.

#### 🤔 تفعيل الفهم (اسأل نفسك):
> **سؤال:** لماذا استغرقت أنظمة الخبرة التقليدية (`MYCIN`, `XCON`) وقتًا أطول بكثير؟
> **لماذا هذا مهم؟** لأنه يوضح الدافع الاقتصادي وراء انتشار `rule induction` الآلي.

---

### 3. مثال الغولف (Golf Example)

#### النص الأصلي يقول:
> "A fictitious example... is that of a golfer who decides whether or not to play each day on the basis of the weather. Figure 3.1 shows the results of two weeks (14 days) of observations of weather conditions and the decision on whether or not to play."

#### الشرح المبسّط:
لدينا مجموعة تدريب (`training set`) من 14 يومًا (`instances`)، كل يوم موصوف بأربع صفات (`attributes`):
- `Outlook`: صفة تصنيفية (`categorical`) — `sunny`، `overcast`، `rain`
- `Temperature`: صفة مستمرة (`continuous`، بالفهرنهايت)
- `Humidity`: صفة مستمرة (نسبة مئوية)
- `Windy`: صفة تصنيفية ثنائية — `true`/`false`

والتصنيف (`classification`) الهدف هو `play` أو `don't play`.

**لماذا؟** هذا مثال تعليمي كلاسيكي (استخدمه `Quinlan` مبتكر خوارزميات `ID3`/`C4.5`) لأنه صغير بما يكفي ليُتتبَّع يدويًا، ويحوي مزيجًا من الصفات التصنيفية والمستمرة.

#### 💡 التشبيه:
> تمامًا مثل أن تقرر "هل أخرج بالمظلة اليوم؟" بناءً على السماء والرطوبة والرياح.
> **وجه الشبه:** كل عامل جوي = attribute، والقرار = class.

### 3.1 الشجرة الناتجة لمثال الغولف

#### النص الأصلي يقول:
> "1. If the value of Outlook is sunny, next consider the value of Humidity. If the value is less than or equal to 75 the decision is play. Otherwise the decision is don't play. 2. If the value of Outlook is overcast, the decision is play. 3. If the value of Outlook is rain, next consider the value of Windy. If the value is true the decision is don't play, otherwise the decision is play. Note that the value of Temperature is never used."

#### الشرح المبسّط:
تُقرأ الشجرة من الجذر (`root node` = `Outlook`) نزولًا حتى ورقة (`leaf`):
- `sunny` → انظر `Humidity`: `≤75` → `play`، `>75` → `don't play`
- `overcast` → `play` مباشرة (بلا حاجة لأي صفة إضافية)
- `rain` → انظر `Windy`: `true` → `don't play`، `false` → `play`

الملاحظة المهمة: صفة `Temperature` **لم تُستخدم إطلاقًا** في الشجرة رغم وجودها في البيانات.

**لماذا؟** لأن خوارزمية بناء الشجرة تختار فقط الصفات التي تُحسّن الفصل بين الأصناف (`classes`)؛ `Temperature` لم تكن ضرورية للفصل الكامل بين `play`/`don't play` في هذه البيانات تحديدًا.

#### 📊 المخطط: شجرة القرار لمثال الغولف

#### ما هذا المخطط؟
> يوضّح تدفق القرار من صفة `Outlook` وصولًا للتصنيف النهائي، وهو تمثيل بصري لقواعد `IF...THEN`.

#### وصف العُقد:
| # | العُقدة | النوع `kind` | الشرح |
| --- | --- | --- | --- |
| 1 | Outlook | decision (root) | العقدة الجذر، أول صفة يُختبر عليها |
| 2 | Humidity | decision (internal) | تُختبر فقط عند `sunny` |
| 3 | Windy | decision (internal) | تُختبر فقط عند `rain` |
| 4 | play (×3) | leaf | نتيجة نهائية = العب |
| 5 | don't play (×2) | leaf | نتيجة نهائية = لا تلعب |

#### وصف الروابط:
| من | إلى | التسمية | نوع السهم | الشرح |
| --- | --- | --- | --- | --- |
| Outlook | Humidity | sunny | branch | فرع القيمة sunny |
| Outlook | play | overcast | branch | فرع القيمة overcast (نتيجة مباشرة) |
| Outlook | Windy | rain | branch | فرع القيمة rain |
| Humidity | play | ≤75 | branch | شرط رقمي |
| Humidity | don't play | >75 | branch | شرط رقمي |
| Windy | don't play | true | branch | قيمة منطقية |
| Windy | play | false | branch | قيمة منطقية |

```diagram
type: decision-tree
title: Golf Decision Tree
direction: TD
nodes:
  - id: outlook
    label: Outlook
    kind: decision
    level: 0
  - id: humidity
    label: Humidity
    kind: decision
    level: 1
  - id: windy
    label: Windy
    kind: decision
    level: 1
  - id: play1
    label: play
    kind: leaf
    level: 2
  - id: dontplay1
    label: don't play
    kind: leaf
    level: 2
  - id: play2
    label: play
    kind: leaf
    level: 1
  - id: dontplay2
    label: don't play
    kind: leaf
    level: 2
  - id: play3
    label: play
    kind: leaf
    level: 2
edges:
  - from: outlook
    to: humidity
    label: sunny
  - from: outlook
    to: play2
    label: overcast
  - from: outlook
    to: windy
    label: rain
  - from: humidity
    to: play1
    label: "≤75"
  - from: humidity
    to: dontplay1
    label: ">75"
  - from: windy
    to: dontplay2
    label: "true"
  - from: windy
    to: play3
    label: "false"
```

#### مهم للامتحان ⚠️:
> شجرة القرار ليست بالضرورة تستخدم كل الصفات المتاحة — فقط الصفات اللازمة لفصل الأصناف تمامًا.

---

### 4. المصطلحات الأساسية (Terminology)

#### النص الأصلي يقول:
> "There is a universe of objects... each of which can be described by the values of a collection of its attributes. Attributes with a finite (and generally fairly small) set of values... are called categorical. Attributes with numerical values... are generally known as continuous."

#### الشرح المبسّط:
| المصطلح | التعريف | مثال/ملاحظة |
| --- | --- | --- |
| `instance` | صف واحد في `training set` يمثّل كائنًا واحدًا بقيم صفاته وتصنيفه | يوم واحد في مثال الغولف |
| `attribute` | خاصية غير تصنيفية تصف الكائن | `Outlook`, `Humidity` |
| `categorical attribute` | صفة ذات مجموعة قيم منتهية وصغيرة نسبيًا | `Outlook` = {sunny, overcast, rain} |
| `continuous attribute` | صفة ذات قيمة رقمية | `Temperature`, `Humidity` |
| `classification` | الصفة الخاصة المصنِّفة (الهدف) | `play`/`don't play` |
| `training set` | مجموعة الـ`instances` المستخدمة لبناء الشجرة | 14 يومًا |
| `splitting` | اختبار قيمة صفة وإنشاء فرع لكل قيمة | تقسيم حسب `Outlook` |
| `split value` | القيمة الحدّية المستخدمة لتقسيم صفة مستمرة (`≤` أو `>`) | `Humidity ≤ 75` |

**لماذا؟** لأن التمييز بين `categorical` و`continuous` يُحدد طريقة الانقسام (`splitting`): تفرّع لكل قيمة تصنيفية، أو مقارنة `≤`/`>` لصفة مستمرة.

#### 💡 التشبيه:
> `categorical` مثل ألوان إشارة المرور (أحمر/أصفر/أخضر) — عدد محدود من الخيارات المنفصلة.
> **وجه الشبه:** كل قيمة تصنيفية = فرع منفصل تمامًا، بلا "بينهما".

### 4.1 وظيفتا شجرة القرار: الضغط والتنبؤ

#### النص الأصلي يقول:
> "Decision trees have two different functions: data compression and prediction... It can be used to predict the values of other instances not in the training set... This 'decision' is only a prediction, which may or may not turn out to be correct. There is no infallible way to predict the future!"

#### الشرح المبسّط:
1. **الضغط (`data compression`):** الشجرة تمثّل نفس معلومات جدول البيانات بشكل أكثر إيجازًا.
2. **التنبؤ (`prediction`):** يمكن استخدام الشجرة لتصنيف حالات جديدة لم تكن ضمن `training set`، تُسمى `unseen instances`، ومجموعتها `test set`.

**لماذا؟** لأن الهدف الحقيقي لتعلّم الآلة ليس حفظ البيانات القديمة، بل التعميم (`generalisation`) للتنبؤ بحالات مستقبلية — مع التنبيه أن التنبؤ **ليس مضمون الصحة 100%**.

#### الفهم الخاطئ الشائع ❌: الشجرة تعطي إجابة مؤكدة دائمًا.
#### الفهم الصحيح ✅: الشجرة تعطي *تنبؤًا* (`prediction`) وليس يقينًا مطلقًا؛ قد يخطئ على `unseen instances`.

---

### 5. مجموعة بيانات الدرجات الجامعية (The degrees Dataset)

#### النص الأصلي يقول:
> "The training set shown in Figure 3.3... shows the results of students for five subjects coded as SoftEng, ARIN, HCI, CSA and Project and their corresponding degree classifications... There are 26 instances."

#### الشرح المبسّط:
مثال ثانٍ لتثبيت المفاهيم: 5 صفات تصنيفية ثنائية (`A`/`B`) و26 `instance`، والهدف تصنيف الطالب إلى `FIRST` أو `SECOND`. الشجرة الناتجة (شكل 3.4) تستخدم فقط 4 من أصل 5 صفات (`SoftEng`, `Project`, `ARIN`, `CSA`) — بينما `HCI` لم تُستخدم إطلاقًا، تمامًا كما حدث مع `Temperature` في مثال الغولف.

**لماذا؟** لتعزيز نفس المبدأ أن الشجرة تختار فقط الصفات المُميِّزة (`discriminative`) وتتجاهل الصفات غير المفيدة للفصل.

### 5.1 من الشجرة إلى قواعد القرار (Disjunctive Normal Form)

#### النص الأصلي يقول:
> "Each branch corresponds to a classification rule... A set of rules of this kind is said to be in Disjunctive Normal Form (DNF). The individual rules are sometimes known as disjuncts."

#### الشرح المبسّط:
كل مسار من الجذر إلى ورقة = قاعدة واحدة (`IF ... THEN Class = ...`)، وطرف اليسار (`antecedent`) يتكوّن من عدة شروط (`terms`) مربوطة بـ `AND`. مجموع كل القواعد = `DNF` (كل قاعدة = `disjunct` مرتبطة بـ `OR` ضمنية مع الباقي).

قواعد شجرة `degrees`:
```text
IF SoftEng = A AND Project = A THEN Class = FIRST
IF SoftEng = A AND Project = B AND ARIN = A AND CSA = A THEN Class = FIRST
IF SoftEng = A AND Project = B AND ARIN = A AND CSA = B THEN Class = SECOND
IF SoftEng = A AND Project = B AND ARIN = B THEN Class = SECOND
IF SoftEng = B THEN Class = SECOND
```

**لماذا؟** لأن تمثيل `IF-THEN` أسهل للتنفيذ البرمجي المباشر (سطر كود لكل قاعدة)، بينما الشجرة أسهل بصريًا؛ وهما متكافئان تمامًا رياضيًا.

#### 🔄 قبل / بعد: من الشجرة إلى Nested IF

**قبل (تمثيل شجري):**
```text
SoftEng
├─ A → Project
│      ├─ A → FIRST
│      └─ B → ARIN
│              ├─ A → CSA
│              │       ├─ A → FIRST
│              │       └─ B → SECOND
│              └─ B → SECOND
└─ B → SECOND
```

**بعد (Nested IF...ELSE):**
```text
if (SoftEng = A) {
  if (Project = A) Class = FIRST
  else {
    if (ARIN = A) {
      if (CSA = A) Class = FIRST
      else Class = SECOND
    }
    else Class = SECOND
  }
}
else Class = SECOND
```

**ماذا تغيّر؟** لا شيء منطقيًا — فقط تمثيل أكثر إيجازًا (`compression` أعلى: 14 مصطلحًا في القواعد، أو أقل في الشكل المتداخل، مقابل 130 مصطلحًا لو عاملنا كل صف كقاعدة مستقلة).

#### ⚖️ المقايضة: قواعد DNF مقابل Nested IF

| | DNF (قواعد مسطّحة) | Nested IF...ELSE |
| --- | --- | --- |
| المزايا | كل قاعدة مستقلة، سهلة القراءة والتعديل، ترتيبها لا يهم | أكثر إيجازًا (لا تكرار للشروط المشتركة) |
| العيوب | تكرار شروط مشتركة بين القواعد (`SoftEng = A` يتكرر 4 مرات) | تغيير شرط داخلي قد يؤثر على عدة فروع |
| متى تختاره | عند الحاجة لتفسير كل قاعدة منفردة (Expert Systems) | عند الحاجة لتنفيذ برمجي فعّال (`code`) |

#### 📐 المعادلة: نسبة الضغط (Compression)

$$
\text{Compression \%} = \left(1 - \frac{\text{terms in tree rules}}{\text{terms if each instance is a rule}}\right) \times 100
$$

**الشرح:**
> - `terms in tree rules` = مجموع الشروط في كل قواعد الشجرة (14 لمثال `degrees`)
> - `terms if each instance is a rule` = عدد الصفات × عدد الحالات (5 × 26 = 130)
> - النتيجة هنا ≈ 89.2% (النص يذكر "almost 90%")

---

### 6. خوارزمية TDIDT (Top-Down Induction of Decision Trees)

#### النص الأصلي يقول:
> "In the standard formulation of the TDIDT algorithm there is a training set of instances... At each non-leaf node an attribute is chosen for splitting. This can potentially be any attribute, except that the same attribute must not be chosen twice in the same branch."

#### الشرح المبسّط:
`TDIDT` هي الخوارزمية الأساسية المشتركة خلف معظم أنظمة بناء الأشجار الشهيرة (`ID3`، `C4.5`). تعمل بمبدأ `recursive partitioning` (التقسيم التكراري): إن كانت كل الحالات في نفس الصنف، أرجع الصنف؛ وإلا اختر صفة للتقسيم عليها وكرر العملية على كل فرع فرعي.

**قيد مهم:** لا يجوز اختيار نفس الصفة مرتين في نفس الفرع — وهذا **قيد غير ضارّ** (`innocuous`) لأن قيمتها ستكون معروفة مسبقًا في ذلك الفرع فلا فائدة من إعادة اختبارها، وهو ما يضمن **انتهاء الخوارزمية حتمًا** (`termination guaranteed`) لأن أقصى طول لأي فرع هو `M` (عدد الصفات).

**لماذا؟** هذا الضمان الرياضي (`termination`) أساسي لأي خوارزمية عملية — بدونه قد تدور الخوارزمية إلى ما لا نهاية.

#### ⚙️ الخطوات / الخوارزمية: TDIDT الأساسية

#### ما هدف هذه العملية؟
> بناء شجرة قرار كاملة من `training set` بشكل تكراري (`recursive`) حتى تصبح كل ورقة نقية (`pure` — تحوي صنفًا واحدًا فقط).

```algorithm
1 | تحقق من التجانس | فحص الأصناف | إن كانت كل الحالات في التدريب لها نفس Class، أرجع قيمة هذا الـ Class كورقة
2 | اختيار صفة | معيار اختيار (غير محدد في هذا الفصل) | اختر صفة A لم تُستخدم سابقًا في هذا الفرع
3 | فرز الحالات | تقسيم البيانات | قسّم instances إلى مجموعات فرعية، مجموعة لكل قيمة من قيم A
4 | بناء الفروع | استدعاء تكراري (recursion) | لكل مجموعة فرعية غير فارغة، أنشئ فرعًا وطبّق الخوارزمية عليه من جديد
5 | الإرجاع | تجميع الشجرة | أرجع الشجرة الكاملة: كل فرع ينتهي إما بشجرة فرعية أو قيمة صنف
```

#### نقاط التنفيذ:
- لا يجوز اختيار نفس الصفة مرتين في نفس الفرع (المسار من الجذر إلى تلك النقطة).
- الخوارزمية **غير محدَّدة بالكامل** (`underspecified`): لا تحدد *كيف* تُختار الصفة في الخطوة 2 — أي اختيار (حتى العشوائي) سينتج شجرة صحيحة تقنيًا لكنها قد تكون رديئة للتنبؤ. اختيار الصفة الجيد هو موضوع الفصلين 4 و5.

#### 💡 التشبيه:
> مثل لعبة "20 سؤالاً" — كل سؤال يُقسّم الاحتمالات الممكنة، وتتوقف عندما يتبقى احتمال واحد فقط (إجابة أكيدة).
> **وجه الشبه:** كل سؤال = صفة يُختار الانقسام عليها، والإجابة النهائية = leaf node.

### 6.1 شرط الكفاية (Adequacy Condition)

#### النص الأصلي يقول:
> "There is one important condition which must hold before the TDIDT algorithm can be applied. This is the Adequacy Condition: no two instances with the same values of all the attributes may belong to different classes."

#### الشرح المبسّط:
لكي تعمل `TDIDT` بشكل صحيح، يجب ألا يوجد صفّان (`instances`) لهما نفس قيم كل الصفات لكن بتصنيف مختلف — أي يجب أن يكون `training set` **متسقًا** (`consistent`). إن وُجد تناقض، لا يمكن الوصول لورقة نقية مهما استمر التقسيم.

**لماذا؟** لأن الخوارزمية تتوقف فقط عندما تصبح كل مجموعة فرعية "نقية" (صنف واحد)؛ لو وُجدت حالتان متطابقتان تمامًا في الصفات لكن بصنف مختلف، لا يوجد أي تقسيم إضافي يمكن أن يفصل بينهما — فتفشل الخوارزمية في التوقف بشكل نظيف.

#### مهم للامتحان ⚠️:
> `Adequacy Condition` شرط **مسبق** (`precondition`) وليس جزءًا من خطوات الخوارزمية نفسها — يجب التحقق منه *قبل* التطبيق.

#### 🤔 تفعيل الفهم (اسأل نفسك):
> **سؤال:** ماذا يحدث إذا طُبّقت `TDIDT` على بيانات لا تحقق `Adequacy Condition`؟
> **لماذا هذا مهم؟** لأن التعامل مع البيانات غير المتسقة موضوع أساسي لاحق (الفصل 8) وسؤال شائع في الامتحانات.

---

### 7. أنواع الاستدلال المنطقي (Types of Reasoning)

#### النص الأصلي يقول:
> "Logicians distinguish between different types of reasoning. The most familiar is deduction... A second type of reasoning is called abduction... A third type of reasoning is called induction. This is a process of generalisation based on repeated observations."

#### الشرح المبسّط:
| النوع | التعريف | مثال من النص | الموثوقية |
| --- | --- | --- | --- |
| `deduction` (استنباط) | النتيجة تلزم حتمًا من صحة المقدمات | كل إنسان فانٍ، جون إنسان ⟹ جون فانٍ | 100% إذا صحّت المقدمات |
| `abduction` (اختطاف/تخمين) | النتيجة مُتَّسقة مع المقدمات لكن غير مؤكدة | كل الكلاب تطارد القطط، فيدو يطارد القطط ⟹ فيدو كلب (قد يكون خطأ) | قد تكون خاطئة |
| `induction` (استقراء) | تعميم مبني على ملاحظات متكررة | رأيت 1000 كلب بأربع أرجل ⟹ كل الكلاب لها أربع أرجل | يعتمد على البيانات، ليس معصومًا |

**أشجار القرار (مثال الغولف والدرجات) هي نتاج `induction`** — تُعمَّم من الحالات المُلاحَظة (`training set`) لتوقع حالات جديدة.

**لماذا؟** لفهم الحدود المعرفية للنموذج: شجرة القرار ليست حقيقة منطقية (`deduction`)، بل تعميم إحصائي قابل للخطأ.

#### 💡 التشبيه:
> `abduction` مثل الطبيب الذي يشخّص المرض بناءً على الأعراض — التشخيص منطقي لكن قد يكون خاطئًا (أعراض متشابهة لأمراض مختلفة).
> **وجه الشبه:** الأعراض = premises، التشخيص = conclusion غير مؤكد.

---

## الجزء الثاني: ملخص منظم

### أهم التعاريف والمفاهيم
| المصطلح | التعريف | مثال/ملاحظة |
| --- | --- | --- |
| `decision tree` | تمثيل شجري لقواعد التصنيف | شجرة الغولف |
| `decision rules` | تمثيل مكافئ على شكل IF...THEN | قواعد DNF |
| `TDIDT` | خوارزمية بناء الشجرة تنازليًا بالتقسيم التكراري | Fig 3.5 |
| `Adequacy Condition` | لا يوجد صفّان متطابقا الصفات بصنفين مختلفين | شرط مسبق للتطبيق |
| `instance` | صف بيانات واحد | يوم واحد / طالب واحد |
| `attribute` | خاصية وصفية غير الهدف | `Outlook`, `SoftEng` |
| `classification` | الصفة الهدف | `play`, `FIRST/SECOND` |
| `categorical` | صفة محدودة القيم | `Windy` |
| `continuous` | صفة رقمية | `Temperature` |
| `split value` | قيمة حدّية للتقسيم على صفة مستمرة | `Humidity ≤ 75` |
| `root node` | العقدة الأولى (كل الـtraining set) | `Outlook` |
| `internal node` | عقدة ليست جذرًا ولا ورقة | `Humidity`, `Windy` |
| `leaf node` | عقدة نهائية تحمل تصنيفًا | `play`, `don't play` |
| `branch` | مسار من الجذر إلى ورقة = قاعدة واحدة | 5 فروع في `degrees` |
| `DNF` | مجموعة قواعد مرتبطة منطقيًا بـ OR | قواعد `degrees` |
| `antecedent` | الجانب الأيسر من قاعدة IF...THEN | `SoftEng = A AND ...` |
| `term` | شرط مفرد داخل antecedent | `SoftEng = A` |
| `training set` | بيانات بناء النموذج | 14 أو 26 حالة |
| `test set` / `unseen instances` | بيانات جديدة للتنبؤ | يوم لم يُرَ سابقًا |
| `data compression` | تقليل عدد المصطلحات اللازمة لتمثيل البيانات | 130 → 14 |
| `recursive partitioning` | تقسيم البيانات تكراريًا حسب الصفات | جوهر `TDIDT` |
| `deduction` / `abduction` / `induction` | أنواع الاستدلال المنطقي | انظر جدول القسم 7 |

### المكونات الرئيسية (مرجع سريع)
| المكوّن | الدور |
| --- | --- |
| Root node | نقطة البداية، تمثل كامل training set |
| Internal nodes | اختبارات وسيطة على صفات |
| Leaf nodes | القرار/التصنيف النهائي |
| Branches | قيم/شروط الانتقال بين العقد |

### مقارنات
| المقارنة | الفرق الجوهري |
| --- | --- |
| `categorical` مقابل `continuous` | تصنيفية: تفرّع لكل قيمة منفصلة — مستمرة: تفرّع بمقارنة `≤`/`>` عند split value |
| `decision tree` مقابل `decision rules` | تمثيلان متكافئان تمامًا للمنطق نفسه؛ الشجرة أوضح بصريًا، القواعد أسهل تعديلًا فرديًا |
| `deduction` مقابل `induction` | الاستنباط يقيني من مقدمات صحيحة، الاستقراء تعميم احتمالي من ملاحظات |

### مصطلحات (Glossary)
راجع جدول "أهم التعاريف والمفاهيم" أعلاه — يُستخدم كمرجع سريع شامل.

### نقاط ذهبية
1. الشجرة قد لا تستخدم كل الصفات المتاحة (مثال: `Temperature`, `HCI`).
2. `TDIDT` مضمونة الانتهاء (`termination`) بسبب قيد عدم تكرار الصفة في نفس الفرع.
3. الخوارزمية الأساسية **غير محددة** طريقة اختيار الصفة — وهذا موضوع الفصلين القادمين.
4. `Adequacy Condition` شرط ضروري مسبق، وليس جزءًا من خطوات التنفيذ.

### أخطاء شائعة
| الخطأ | التصحيح |
| --- | --- |
| الظن أن الشجرة يجب أن تستخدم كل الصفات | الشجرة تستخدم فقط الصفات المُميِّزة (`discriminative`) |
| الخلط بين `abduction` و`induction` | `abduction` استنتاج حالة مفردة، `induction` تعميم من ملاحظات متكررة |
| افتراض أن أي اختيار عشوائي للصفة يُنتج شجرة جيدة للتنبؤ | صحيح تقنيًا (تنتهي الخوارزمية) لكن الجودة التنبؤية تعتمد على اختيار ذكي (Ch.4-5) |
| نسيان التحقق من `Adequacy Condition` قبل التطبيق | يجب التأكد من عدم وجود تناقض في البيانات أولًا |

### خطوات وإجراءات المحاضرة
(انظر بلوك `⚙️ الخطوات / الخوارزمية: TDIDT الأساسية` في القسم 6 أعلاه — هو الخوارزمية الوحيدة الصريحة في هذا الفصل.)

### أنماط الأكواد
لا تحتوي هذه المحاضرة (الفصل النظري) على كود صريح؛ القسم الخامس أدناه يقدّم كود R/Python **تطبيقي** (شرح زيادة للفهم) لبناء شجرة قرار فعليًا باستخدام نفس بيانات الغولف.

### أنماط التعامل
- عند مواجهة صفة مستمرة، ابحث دائمًا عن `split value` بدل قائمة قيم.
- عند قراءة أي شجرة، تتبّع المسار من الجذر حتى الورقة لكتابة القاعدة المكافئة.
- تحقّق من `Adequacy Condition` كخطوة أولى قبل أي تطبيق لـ`TDIDT`.

### الأفكار الشاملة
`TDIDT` تجسّد نمط `divide and conquer` الشهير في علوم الحاسوب: مسألة تصنيف كبيرة تُحل بتقسيمها تكراريًا لمسائل فرعية أصغر حتى تصبح تافهة الحل (كل ورقة = صنف واحد).

---

## الجزء الثالث: أسئلة اختيار من متعدد (MCQ)

> 20 سؤالاً — medium/hard. التوزيع: مقارنات (4) | سيناريو كود (5) | تطبيق (7) | تتبع خوارزميات (4).

### السيناريو 1: بيانات الغولف
> يوم جديد: `Outlook=sunny`, `Temperature=74`, `Humidity=77`, `Windy=false`.

### السؤال 1 (تطبيق)
ما تصنيف هذا اليوم وفق شجرة الشكل 3.2؟
أ) play
ب) don't play
ج) لا يمكن تحديده لأن Temperature غير مستخدمة
د) يعتمد على Windy فقط

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خطأ: عند sunny، نتحقق من Humidity وليس مباشرة play.
- ب) صحيح: sunny → Humidity=77 > 75 → don't play.
- ج) خطأ: عدم استخدام Temperature لا يمنع التصنيف، فالشجرة لا تحتاجها أصلاً.
- د) خطأ: Windy تُفحص فقط في فرع rain، لا في فرع sunny.

### السؤال 2 (تتبع خوارزمية)
كم صفة فعليًا تم اختبارها للوصول للتصنيف في هذا المثال؟
أ) 1
ب) 2
ج) 3
د) 4

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خطأ: صفة واحدة (Outlook) لا تكفي لتحديد القرار عند sunny.
- ب) صحيح: Outlook ثم Humidity — فرعان فقط تم اجتيازهما.
- ج) خطأ: Windy لم تُختبر لأن المسار انتهى عند Humidity.
- د) خطأ: Temperature لا تُستخدم في هذه الشجرة إطلاقًا.

### السؤال 3 (سيناريو كود)
```r
predict_golf <- function(outlook, humidity, windy) {
  if (outlook == "sunny") {
    if (humidity <= 75) "play" else "don't play"
  } else if (outlook == "overcast") {
    "play"
  } else {
    if (windy) "don't play" else "play"
  }
}
predict_golf("rain", 70, TRUE)
```
ما ناتج هذا الاستدعاء؟
أ) play
ب) don't play
ج) خطأ في التنفيذ (Error)
د) NA

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خطأ: rain مع windy=TRUE يعطي don't play وليس play.
- ب) صحيح: outlook="rain" → windy=TRUE → "don't play".
- ج) خطأ: الكود صحيح تركيبيًا (syntax صحيح) ولا يوجد خطأ تنفيذي.
- د) خطأ: كل الفروع مُعرَّفة، فلا يوجد مسار يُرجع NA.

---

### السيناريو 2: بيانات الدرجات
> طالب: `SoftEng=A`, `Project=B`, `ARIN=A`, `CSA=A`.

### السؤال 4 (تطبيق)
ما تصنيف هذا الطالب؟
أ) FIRST
ب) SECOND
ج) غير محدد لعدم معرفة HCI
د) FIRST إذا وفقط إذا HCI=A

**الإجابة الصحيحة: أ**
**التعليل:**
- أ) صحيح: SoftEng=A, Project=B, ARIN=A, CSA=A → FIRST حسب القاعدة الثالثة.
- ب) خطأ: SECOND تحدث فقط عندما CSA=B ضمن هذا المسار.
- ج) خطأ: HCI لا تدخل في أي قاعدة من قواعد شجرة degrees.
- د) خطأ: القرار مستقل تمامًا عن قيمة HCI.

### السؤال 5 (تتبع خوارزمية)
كم عدد الشروط (terms) في القاعدة التي طُبّقت على هذا الطالب؟
أ) 2
ب) 3
ج) 4
د) 5

**الإجابة الصحيحة: ج**
**التعليل:**
- أ) خطأ: القاعدة تحتاج أكثر من شرطين للوصول لـ CSA.
- ب) خطأ: 3 شروط لا تكفي (تصل فقط إلى ARIN).
- ج) صحيح: SoftEng=A AND Project=B AND ARIN=A AND CSA=A → 4 شروط.
- د) خطأ: القاعدة لا تتضمن HCI فتبقى عند 4 وليس 5.

### السؤال 6 (مقارنة)
لماذا لا تظهر صفة HCI في شجرة الشكل 3.4 رغم وجودها في البيانات؟
أ) لأنها صفة مستمرة ولا يمكن للشجرة معالجتها
ب) لأنها لم تكن ضرورية لفصل الأصناف بشكل تام في هذه البيانات
ج) لأن TDIDT يحذف أول صفة أبجديًا
د) لأنها تحتوي قيمًا مفقودة

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خطأ: HCI صفة تصنيفية (A/B) مثل باقي الصفات، وليست مستمرة.
- ب) صحيح: نفس مبدأ Temperature في مثال الغولف — الصفات غير المميِّزة لا تُستخدم.
- ج) خطأ: لا علاقة للترتيب الأبجدي باختيار TDIDT للصفات.
- د) خطأ: لا ذكر لقيم مفقودة في النص الأصلي لهذه البيانات.

---

### السؤال 7 (تطبيق)
وفق `Adequacy Condition`، أي من الحالات التالية تجعل مجموعة بيانات "غير متسقة" (inconsistent)؟
أ) وجود صفة برقم عائم بدل عدد صحيح
ب) وجود instance له نفس قيم جميع الصفات مثل instance آخر لكن بصنف مختلف
ج) وجود أكثر من صنف ممكن (multi-class وليس ثنائي)
د) عدم توازن عدد حالات كل صنف (class imbalance)

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خطأ: نوع البيانات الرقمي لا علاقة له بالاتساق المنطقي.
- ب) صحيح: هذا هو تعريف مخالفة Adequacy Condition حرفيًا من النص.
- ج) خطأ: التعدد الصنفي (multi-class) مسموح به أصلاً في TDIDT.
- د) خطأ: عدم التوازن مشكلة أداء محتملة، لكنه لا يخالف شرط الاتساق.

### السؤال 8 (تتبع خوارزمية)
ما الحد الأقصى النظري لطول أي فرع في شجرة ناتجة عن TDIDT إذا كان هناك M صفة؟
أ) M/2
ب) M
ج) M²
د) لا يوجد حد أقصى

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خطأ: لا علاقة رياضية بالقسمة على 2 في ضمان الإنهاء.
- ب) صحيح: النص يذكر صراحة أن أقصى طول فرع هو M لأن كل صفة تُستخدم مرة واحدة كحد أقصى في الفرع.
- ج) خطأ: M² غير منطقي هنا لأن كل صفة تظهر مرة واحدة فقط لكل فرع.
- د) خطأ: القيد بعدم تكرار الصفة في نفس الفرع يضمن وجود حد أقصى فعلي.

### السؤال 9 (سيناريو كود)
```python
def build_leaf(instances):
    classes = set(i["class"] for i in instances)
    if len(classes) == 1:
        return classes.pop()
    return None  # (1) يجب اختيار صفة للتقسيم هنا
```
ماذا يمثل التعليق `(1)` في سياق خوارزمية TDIDT؟
أ) خطوة إنهاء الخوارزمية
ب) الخطوة (a) من الخوارزمية: اختيار صفة للتقسيم
ج) التحقق من Adequacy Condition
د) حساب data compression

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خطأ: هذا الجزء بالضبط هو ما يحدث عندما *لا* تتحقق شروط الإنهاء (لم تتفق كل الأصناف).
- ب) صحيح: عندما لا تكون كل الأصناف متطابقة، الخطوة التالية في TDIDT هي اختيار صفة للتقسيم.
- ج) خطأ: التحقق من Adequacy Condition يحدث قبل تشغيل الخوارزمية أصلاً، وليس داخل هذه الدالة.
- د) خطأ: حساب الضغط لا علاقة له ببناء عقدة فردية.

### السؤال 10 (تطبيق)
ما العبارة الصحيحة بخصوص قيد "عدم اختيار نفس الصفة مرتين في نفس الفرع"؟
أ) قيد تعسفي يقلل جودة الشجرة
ب) قيد غير ضار لأن قيمة الصفة تكون معروفة أصلاً في ذلك الفرع
ج) ينطبق فقط على الصفات المستمرة
د) يُلغى تلقائيًا إذا كانت البيانات كبيرة

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خطأ: النص يصفه بأنه "entirely innocuous" (غير ضار إطلاقًا)، وليس تعسفيًا.
- ب) صحيح: إعادة اختبار صفة معروفة القيمة في نفس الفرع لا تضيف أي معلومة جديدة.
- ج) خطأ: القيد عام لجميع أنواع الصفات، تصنيفية كانت أم مستمرة.
- د) خطأ: القيد جزء من تعريف الخوارزمية نفسها، لا علاقة لحجم البيانات به.

### السؤال 11 (مقارنة)
ما الفرق الجوهري بين `deduction` و`abduction`؟
أ) deduction تعميم من ملاحظات، abduction استنتاج يقيني
ب) deduction نتيجة يقينية من مقدمات صحيحة، abduction نتيجة متسقة لكن غير مؤكدة
ج) لا فرق، وهما مترادفان
د) abduction تُستخدم فقط في decision trees

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خطأ: هذا وصف induction وليس deduction.
- ب) صحيح: طابق تعريف النص تمامًا (مثال "جون فانٍ" مقابل مثال "فيدو كلب").
- ج) خطأ: هما نوعان مختلفان تمامًا من الاستدلال المنطقي.
- د) خطأ: abduction مفهوم منطقي عام، غير مرتبط حصرًا بأشجار القرار.

### السؤال 12 (تتبع خوارزمية)
عند تطبيق TDIDT على مجموعة فرعية أصبحت كلها من نفس الصنف، ماذا تفعل الخوارزمية؟
أ) تستمر بالتقسيم لتحسين الدقة
ب) تُرجع قيمة ذلك الصنف كورقة مباشرة
ج) تتوقف بخطأ لأنه لا يوجد صفة متبقية
د) تختار صفة عشوائية للتأكيد

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خطأ: لا داعي للاستمرار؛ الشرط الأول في الخوارزمية يوقف التكرار فورًا.
- ب) صحيح: هذا نص الخطوة الأولى في IF...THEN...ELSE للخوارزمية الأساسية.
- ج) خطأ: لا يوجد "خطأ" هنا؛ هذا هو الوضع المثالي (حالة إيقاف ناجحة).
- د) خطأ: لا حاجة لاختيار أي صفة إضافية بعد تحقق التجانس.

### السؤال 13 (تطبيق)
ما نوع الاستدلال الذي تمثله عملية بناء شجرة القرار من بيانات الغولف؟
أ) deduction
ب) abduction
ج) induction
د) لا شيء مما سبق، فهي عملية حسابية بحتة

**الإجابة الصحيحة: ج**
**التعليل:**
- أ) خطأ: deduction يقيني من مقدمات، لا ينطبق على تعميم من عينة بيانات.
- ب) خطأ: abduction تفسير حالة مفردة، لا بناء نموذج من ملاحظات متكررة.
- ج) صحيح: النص يصرّح أن أشجار الغولف والدرجات "of this kind" أي induction.
- د) خطأ: رغم الحساب، جوهرها المنطقي هو تعميم استقرائي.

### السؤال 14 (سيناريو كود)
```python
from sklearn.tree import DecisionTreeClassifier
clf = DecisionTreeClassifier()
clf.fit(X_train, y_train)
clf.predict(X_new)
```
أي جزء من هذا الكود يقابل مفهوم "training set" في النص؟
أ) DecisionTreeClassifier()
ب) X_train, y_train
ج) X_new
د) clf.predict

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خطأ: هذا فقط إنشاء الكائن (object)، لا علاقة له بالبيانات.
- ب) صحيح: X_train, y_train هما بيانات التدريب المستخدمة في fit()، أي training set.
- ج) خطأ: X_new تمثل unseen instances وليس training set.
- د) خطأ: predict() هي خطوة التنبؤ (prediction) وليست التدريب.

### السؤال 15 (تطبيق)
إذا حصل التناقض التالي في training set: (Outlook=sunny, Temp=75, Humidity=70, Windy=false, Class=play) و(Outlook=sunny, Temp=75, Humidity=70, Windy=false, Class=don't play)، فماذا يحدث؟
أ) لا مشكلة، TDIDT تتعامل معها تلقائيًا
ب) البيانات تخالف Adequacy Condition ويجب معالجتها قبل التطبيق
ج) الخوارزمية تختار الصنف الأكثر تكرارًا تلقائيًا
د) يتم حذف الصفة Windy تلقائيًا

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خطأ: هذا بالضبط النوع من التناقض الذي يمنع تطبيق الخوارزمية الأساسية بسلاسة.
- ب) صحيح: نفس قيم كل الصفات لكن بصنف مختلف = مخالفة صريحة لـAdequacy Condition.
- ج) خطأ: هذا حل ممكن (يُناقش لاحقًا في الفصل 8) لكنه ليس سلوك الخوارزمية الأساسية.
- د) خطأ: لا يوجد أي آلية لحذف صفات تلقائيًا في TDIDT الأساسية.

### السؤال 16 (مقارنة)
أي عبارة تصف بدقة "data compression" في سياق هذا الفصل؟
أ) ضغط ملف البيانات بصيغة zip
ب) تقليل عدد المصطلحات (terms) اللازمة لتمثيل نفس المعلومات
ج) تقليل عدد الصفوف في training set
د) حذف الصفات غير المهمة من قاعدة البيانات الأصلية

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خطأ: لا علاقة بضغط الملفات الحاسوبي التقليدي.
- ب) صحيح: مثال النص 130 مصطلحًا → 14 مصطلحًا هو بالضبط هذا المفهوم.
- ج) خطأ: عدد الصفوف الأصلي (26) لا يتغير؛ الشجرة تمثيل بديل فقط.
- د) خطأ: الصفات تبقى في البيانات الأصلية؛ فقط الشجرة لا تستخدمها كلها.

### السؤال 17 (تتبع خوارزمية)
```text
Branch so far: IF SoftEng = A AND Project = B .....
```
أي صفة **لا يجوز** اختيارها كخطوة تالية في هذا الفرع؟
أ) ARIN
ب) CSA
ج) HCI
د) SoftEng أو Project

**الإجابة الصحيحة: د**
**التعليل:**
- أ) خطأ: ARIN لم تُستخدم بعد في هذا الفرع، فاختيارها مسموح.
- ب) خطأ: CSA أيضًا غير مُستخدمة بعد، فاختيارها مسموح.
- ج) خطأ: HCI غير مُستخدمة، فاختيارها ممكن تقنيًا (حتى لو لم تظهر في الشجرة النهائية).
- د) صحيح: كلاهما استُخدم مسبقًا في نفس الفرع، فيُمنع اختيارهما مجددًا حسب قيد TDIDT.

### السؤال 18 (تطبيق)
ما العلاقة الصحيحة بين "decision tree" و"decision rules" حسب النص؟
أ) الشجرة أكثر قوة تنبؤية من القواعد
ب) هما تمثيلان متكافئان تمامًا لنفس المنطق
ج) القواعد تُشتق فقط من الأشجار غير الكاملة
د) الشجرة تُستخدم فقط للتدريب، والقواعد فقط للتنبؤ

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خطأ: لا فرق في القوة التنبؤية؛ كلاهما يعطي نفس التصنيف لنفس الحالة تمامًا.
- ب) صحيح: النص يذكر "equivalently a set of decision rules"، أي تكافؤ تام.
- ج) خطأ: القواعد تُشتق من أي شجرة كاملة (branch = rule).
- د) خطأ: كلاهما يمكن استخدامه للتدريب والتنبؤ على حد سواء.

### السؤال 19 (سيناريو كود)
```r
if (SoftEng == "B") {
  class <- "SECOND"
} else if (Project == "A") {
  class <- "FIRST"
} else if (ARIN == "A" && CSA == "A") {
  class <- "FIRST"
} else {
  class <- "SECOND"
}
```
هل هذا الكود مكافئ منطقيًا لقواعد شجرة `degrees` الأصلية؟
أ) نعم تمامًا، لأن ترتيب القواعد في DNF لا يهم
ب) لا، لأنه يفتقد شرط Project=B AND ARIN=A AND CSA=B
ج) لا، لأنه يستخدم HCI بشكل خاطئ
د) نعم، لكن فقط إذا رتّبنا القواعد أبجديًا

**الإجابة الصحيحة: أ**
**التعليل:**
- أ) صحيح: النص يوضح أن ترتيب قواعد DNF عشوائي (arbitrary) ولا يغيّر التنبؤات؛ هذا الكود يغطي كل الحالات بنفس النتائج.
- ب) خطأ: الحالة (Project=B, ARIN=A, CSA=B) تصل فعليًا لآخر else وتُصنَّف SECOND بشكل صحيح، مطابقة للأصل.
- ج) خطأ: الكود لا يستخدم HCI إطلاقًا، وهذا صحيح ومطابق للشجرة الأصلية.
- د) خطأ: لا داعي للترتيب الأبجدي؛ أي ترتيب صحيح للقواعد يعطي نفس النتائج طالما القواعد كاملة وغير متعارضة.

### السؤال 20 (تطبيق)
ما سبب وصف الخوارزمية الأساسية لـTDIDT بأنها "underspecified" (غير محددة بالكامل)؟
أ) لأنها لا تضمن الانتهاء (termination)
ب) لأنها لا تحدد طريقة اختيار الصفة في كل خطوة تقسيم
ج) لأنها لا تدعم الصفات المستمرة إطلاقًا
د) لأنها لا تتحقق من Adequacy Condition

**الإجابة الصحيحة: ب**
**التعليل:**
- أ) خطأ: على العكس، الخوارزمية مضمونة الانتهاء (termination guaranteed) بفضل قيد عدم التكرار.
- ب) صحيح: النص يقول حرفيًا أن الخوارزمية تحدد "Select an attribute" لكن دون تحديد الطريقة.
- ج) خطأ: يُذكر أن الخوارزمية "can be adapted" للصفات المستمرة (تفصيل الفصل 7)، فهذا ليس سبب عدم التحديد.
- د) خطأ: Adequacy Condition شرط مسبق منفصل، وليس هو سبب وصفها بـ"underspecified".

---

## الجزء الرابع: أسئلة تصحيح الكود

### تمرين تصحيح 1 (logic)
**الكود الخاطئ:**
```python
def classify_golf(outlook, humidity, windy):
    if outlook == "sunny" and humidity <= 75:
        return "play"
    elif outlook == "overcast":
        return "play"
    elif outlook == "rain" and windy:
        return "don't play"
```
**اكتشف الخطأ:** الدالة لا تُغطي كل الحالات (لا يوجد `else`/`elif` نهائي)، فستُرجع `None` ضمنيًا لحالتي `sunny & humidity>75` و`rain & not windy`.

**التصحيح:**
```python
def classify_golf(outlook, humidity, windy):
    if outlook == "sunny":
        return "play" if humidity <= 75 else "don't play"
    elif outlook == "overcast":
        return "play"
    else:  # rain
        return "don't play" if windy else "play"
```
**شرح الحل:**
1. كل قيمة من `Outlook` يجب أن تُغطى بفرع صريح (sunny/overcast/rain) — لا فروع مفقودة.
2. عند `sunny`، يجب تغطية كلا احتمالي `humidity` (`≤75` و`>75`) صراحة.
3. استخدام `else` نهائي بدل `elif` مشروط يضمن عدم إرجاع `None` لأي حالة.

### تمرين تصحيح 2 (misconception)
**الكود الخاطئ:**
```r
build_tree <- function(data) {
  # اختر صفة عشوائية دائما لأن أي اختيار يعطي أفضل شجرة
  attr <- sample(names(data), 1)
  split_on(data, attr)
}
```
**اكتشف الخطأ:** التعليق يعكس فهمًا خاطئًا: صحيح أن أي اختيار (حتى العشوائي) **يُنتج شجرة صالحة تقنيًا** (تنتهي الخوارزمية)، لكنه **لا يعطي بالضرورة أفضل شجرة للتنبؤ**.

**التصحيح:**
```r
build_tree <- function(data) {
  # اختيار الصفة يجب أن يعتمد على معيار جودة (مثل information gain)
  # (شرح زيادة للفهم - يُفصَّل في الفصلين 4 و5)
  attr <- select_best_attribute(data)
  split_on(data, attr)
}
```
**شرح الحل:**
1. الخوارزمية الأساسية `underspecified` بخصوص اختيار الصفة، لكن هذا لا يعني تكافؤ كل الاختيارات في الجودة.
2. اختيار عشوائي قد يُنتج شجرة كبيرة وسيئة التعميم على `unseen instances`.
3. معايير مثل `information gain` (موضوع لاحق) تهدف لاختيار الصفة الأكثر تمييزًا بين الأصناف.

### تمرين تصحيح 3 (wrong_test_choice)
**الكود الخاطئ:**
```python
def check_consistency(df):
    # التحقق من Adequacy Condition بمقارنة عدد الصفوف فقط
    return len(df) == len(df.drop_duplicates())
```
**اكتشف الخطأ:** هذا يتحقق من عدم وجود صفوف مكررة بالكامل (بما فيها العمود Class)، لكن `Adequacy Condition` يتطلب فحص أدق: التحقق من عدم وجود صفين لهما **نفس قيم الصفات فقط** (باستثناء Class) لكن بـ Class مختلف.

**التصحيح:**
```python
def check_consistency(df, class_col="Class"):
    feature_cols = [c for c in df.columns if c != class_col]
    grouped = df.groupby(feature_cols)[class_col].nunique()
    return (grouped <= 1).all()
```
**شرح الحل:**
1. `drop_duplicates()` الأصلي يفحص تطابق **كل** الأعمدة، فلا يكشف حالة (نفس الصفات، صنف مختلف).
2. التجميع (`groupby`) على أعمدة الصفات فقط ثم عدّ القيم الفريدة لـ Class هو الاختبار الصحيح لـ Adequacy Condition.
3. اختيار الاختبار الإحصائي/المنطقي المناسب هنا مسألة تعريف دقيق للشرط، لا مجرد فحص تكرار سطحي.

### تمرين تصحيح 4 (wrong_formula)
**الكود الخاطئ:**
```python
compression_pct = (terms_in_rules / terms_if_flat) * 100
```
**اكتشف الخطأ:** هذه الصيغة تحسب **النسبة المتبقية** وليس نسبة **التخفيض** (compression)؛ حسب النص، نسبة الضغط تُحسب كـ (1 - النسبة المتبقية).

**التصحيح:**
```python
compression_pct = (1 - (terms_in_rules / terms_if_flat)) * 100
```
**شرح الحل:**
1. `terms_in_rules / terms_if_flat` = 14/130 ≈ 10.8%، وهي نسبة ما تبقّى من المصطلحات، وليست نسبة الضغط.
2. الصيغة الصحيحة تطرح هذه النسبة من 1 لتعكس "كم قلّ العدد"، وتُعطي ≈ 89.2% تطابقًا مع "almost 90%" في النص.
3. الخلط بين "نسبة المتبقي" و"نسبة الانخفاض" خطأ شائع (`wrong_formula`) عند حساب أي نسبة تخفيض.

### تمرين تصحيح 5 (logic)
**الكود الخاطئ:**
```r
predict_degree <- function(SoftEng, Project, ARIN, CSA, HCI) {
  if (SoftEng == "A" && Project == "A") return("FIRST")
  if (HCI == "A") return("FIRST")   # (!) استخدام خاطئ لـ HCI
  if (SoftEng == "B") return("SECOND")
  return("SECOND")
}
```
**اكتشف الخطأ:** إدراج شرط على `HCI` غير صحيح — هذه الصفة **لا تظهر إطلاقًا** في شجرة `degrees` الأصلية (الشكل 3.4)، فإضافتها تُنتج تصنيفات مخالفة للنموذج الحقيقي.

**التصحيح:**
```r
predict_degree <- function(SoftEng, Project, ARIN, CSA, HCI) {
  if (SoftEng == "A" && Project == "A") return("FIRST")
  if (SoftEng == "A" && Project == "B" && ARIN == "A" && CSA == "A") return("FIRST")
  if (SoftEng == "A" && Project == "B" && ARIN == "A" && CSA == "B") return("SECOND")
  if (SoftEng == "A" && Project == "B" && ARIN == "B") return("SECOND")
  return("SECOND")  # يغطي SoftEng == "B" وأي حالة متبقية
}
```
**شرح الحل:**
1. أي صفة غير موجودة في الشجرة الأصلية يجب ألا تُستخدم في منطق التصنيف المُشتق منها.
2. القواعد الصحيحة الخمس (من القسم 5.1) هي المرجع الوحيد الصحيح لبناء الدالة.
3. `HCI` عادةً `(غير مشروحة في المحاضرة)` كسبب استبعادها — النص لا يفسر *لماذا* تحديدًا لم تُختر، فقط يذكر أنها لم تُستخدم.

### تمرين تصحيح 6 (misconception)
**الكود الخاطئ:**
```python
# اعتقاد خاطئ: الشجرة تتنبأ بدقة 100% دائما على أي بيانات جديدة
def predict_and_trust(tree, new_instance):
    return tree.predict(new_instance)  # النتيجة مضمونة الصحة 100%
```
**اكتشف الخطأ:** الافتراض في التعليق خاطئ مفاهيميًا: شجرة القرار المبنية عبر `induction` تُعطي **تنبؤًا** فقط، وليس ضمانًا يقينيًا (النص: "There is no infallible way to predict the future!").

**التصحيح:**
```python
def predict_and_trust(tree, new_instance):
    prediction = tree.predict(new_instance)
    # التنبؤ قد لا يكون صحيحاً دائماً على unseen instances
    return prediction
```
**شرح الحل:**
1. الشجرة تُعمَّم من `training set` محدود؛ حالات `test set` الجديدة قد تخالف النمط المتعلَّم.
2. الثقة المطلقة (100%) في أي نموذج استقرائي (`induction`) مفهوم خاطئ يجب تصحيحه دومًا.
3. من الناحية العملية يجب تقييم أداء الشجرة على `test set` منفصل قبل الوثوق بتنبؤاتها.

---

## الجزء الرابع: تمارين إضافية (من إعداد الدليل للتدريب)

> هذه تمارين إضافية من إعداد الدليل.

### تمرين 1 (fill_gaps)
أكمل الفراغات في قواعد شجرة الغولف:
```text
IF Outlook = sunny AND Humidity ______ THEN Class = play
IF Outlook = ______ THEN Class = play
IF Outlook = rain AND Windy = ______ THEN Class = don't play
```
**نموذج الحل:**
```text
IF Outlook = sunny AND Humidity <= 75 THEN Class = play
IF Outlook = overcast THEN Class = play
IF Outlook = rain AND Windy = true THEN Class = don't play
```

### تمرين 2 (code_fix)
صحّح الكود التالي بحيث يطابق شجرة `degrees` تمامًا:
```python
def predict(SoftEng, Project, ARIN, CSA):
    if SoftEng == "A":
        return "FIRST"
    return "SECOND"
```
**نموذج الحل:**
```python
def predict(SoftEng, Project, ARIN, CSA):
    if SoftEng == "A":
        if Project == "A":
            return "FIRST"
        else:
            if ARIN == "A":
                return "FIRST" if CSA == "A" else "SECOND"
            else:
                return "SECOND"
    return "SECOND"
```

### تمرين 3 (scenario)
**السيناريو:** لديك `training set` من 10 حالات لتشخيص "حساسية موسمية" بناءً على `Season` (تصنيفية) و`PollenCount` (مستمرة). حالتان لهما نفس `Season` و`PollenCount` لكن تصنيف مختلف (Allergy/No Allergy).

**المطلوب:**
1. هل يمكن تطبيق TDIDT الأساسية مباشرة؟ علّل.
2. ما الحل المقترح؟

**نموذج الحل:**
1. لا، لأن البيانات تخالف `Adequacy Condition` (نفس قيم الصفات، صنف مختلف).
2. يجب إما جمع صفة إضافية تُميّز بين الحالتين، أو معالجة التناقض بطرق متقدمة `(غير مشروحة في المحاضرة - موضوع الفصل 8)` مثل التصويت بالأغلبية على الصنف الأشيع.

### تمرين 4 (hypothesis_test_apply)
*(غير مشروحة مباشرة في هذا الفصل — تمرين ربط بمفاهيم لاحقة، شرح زيادة للفهم)*
**السيناريو:** لديك شجرتان بُنيتا باختيارين مختلفين للصفة الأولى، وتريد معرفة أيهما أفضل تنبؤيًا على `test set` من 50 حالة.

**المطلوب:** صف (بدون تطبيق فعلي، فهذا موضوع فصول لاحقة) الفرق بين مقارنة الدقة (`accuracy`) البسيطة ومقارنة إحصائية أكثر دقة.

**نموذج الحل:** حساب `accuracy` لكل شجرة على نفس `test set` هو أبسط مقارنة (عدد التنبؤات الصحيحة ÷ 50). لإثبات أن الفرق "دلالي إحصائيًا" وليس صدفة، تحتاج اختبارًا مثل `paired t-test` على الأخطاء لكل حالة — وهذا موضوع فصل `Significance Testing`، غير مغطى تفصيليًا هنا.

### تمرين 5 (metric_calculation)
احسب نسبة الضغط (`compression`) إذا كانت شجرة جديدة لها 5 قواعد بمتوسط 3 شروط لكل قاعدة، مقابل بيانات أصلية من 40 حالة و6 صفات.

**نموذج الحل:**
- `terms_in_rules` = 5 × 3 = 15
- `terms_if_flat` = 40 × 6 = 240
- `compression% = (1 - 15/240) × 100 = (1 - 0.0625) × 100 = 93.75%`

### تمرين 6 (code_fix)
```r
# خطأ: لا يتحقق من عدم استخدام نفس الصفة مرتين في نفس الفرع
tdidt <- function(data, used_attrs = c()) {
  attr <- names(data)[1]  # يختار دائما أول عمود!
  ...
}
```
**نموذج الحل:**
```r
tdidt <- function(data, used_attrs = c()) {
  available <- setdiff(names(data), c(used_attrs, "Class"))
  attr <- select_best_attribute(data, available)  # وليس أول عمود فقط
  ...
}
```

---

## الجزء الرابع: تمارين تحليل وتطبيق (إضافية — من إعداد الدليل)

> تمارين تحليلية إضافية — سيناريوهات مؤسسية، إكمال مخططات، جداول قرار.

### تمرين 1: case_study
**السيناريو:** بنك يريد بناء شجرة قرار للموافقة على قروض بناءً على `Income` (مستمرة)، `CreditHistory` (Good/Bad)، `EmploymentStatus` (Employed/Unemployed).

**المطلوب:**
1. صنّف كل صفة كـ `categorical` أو `continuous`.
2. اقترح شكلًا أوليًا محتملًا لأول انقسام (root split) وبرر اختيارك من الناحية المنطقية.

**نموذج الحل:**
1. `Income` = continuous، `CreditHistory` و`EmploymentStatus` = categorical.
2. منطقيًا (وليس إحصائيًا مُثبتًا هنا) قد يُختار `CreditHistory` كجذر لأنه غالبًا الأكثر ارتباطًا المباشر بالموافقة/الرفض — لكن الاختيار الفعلي يتطلب معيارًا كميًا (موضوع الفصل 4).

### تمرين 2: diagram_completion
أكمل شجرة القرار الناقصة التالية لبيانات الغولف (الأقواس هي الفراغات):
```text
Outlook
├─ sunny → Humidity
│           ├─ ≤75 → (____)
│           └─ >75 → (____)
├─ overcast → (____)
└─ rain → Windy
           ├─ true → (____)
           └─ false → (____)
```
**نموذج الحل:** play / don't play / play / don't play / play (بنفس الترتيب أعلاه).

### تمرين 3: table_fill
أكمل الجدول بعدد الشروط (terms) لكل قاعدة من قواعد شجرة `degrees`:

| القاعدة | عدد الشروط |
| --- | --- |
| SoftEng=A AND Project=A → FIRST | ___ |
| SoftEng=A AND Project=B AND ARIN=A AND CSA=A → FIRST | ___ |
| SoftEng=A AND Project=B AND ARIN=A AND CSA=B → SECOND | ___ |
| SoftEng=A AND Project=B AND ARIN=B → SECOND | ___ |
| SoftEng=B → SECOND | ___ |

**نموذج الحل:** 2، 4، 4، 3، 1 (المجموع = 14 كما في النص).

### تمرين 4: written_analysis
اكتب فقرة (3-4 جمل) تشرح لماذا يُعتبر عدم تحديد طريقة اختيار الصفة (`underspecified`) في TDIDT الأساسية "مشكلة غير واضحة للوهلة الأولى" (`not apparent at first sight`) كما وصفها النص.

**نموذج الحل:** لأن الخوارزمية الأساسية تبدو مكتملة رياضيًا (تنتهي دائمًا وتُنتج شجرة صحيحة تصنّف كل `training set` بلا خطأ)، فيسهل الاعتقاد بأنها كافية. لكن جودة الشجرة على بيانات جديدة (`unseen instances`) تعتمد بشكل حاسم على *كيفية* اختيار الصفة في كل خطوة، وهذا غير محدد إطلاقًا في الصيغة الأساسية — فقد ينتج عن اختيار عشوائي شجرة ضخمة عديمة الفائدة تنبؤيًا رغم صحتها الشكلية الكاملة على `training set`.

---

## الجزء الرابع: تمارين تتبع التنفيذ

### تمرين تتبع 1: بناء شجرة الغولف من الصفر (جزئيًا)

**المدخل:**
```r
# 14 حالة من مثال الغولف (Outlook, Windy, Class فقط للتبسيط)
data <- data.frame(
  Outlook = c("sunny","sunny","sunny","sunny","sunny","overcast","overcast",
              "overcast","overcast","rain","rain","rain","rain","rain"),
  Windy   = c(T,T,F,F,F,T,F,T,F,T,T,F,F,F),
  Class   = c("N","N","N","N","P","P","P","P","P","N","N","P","P","P")
)
```

**تتبّع خطوة بخطوة (أكمل الجدول):**
| الخطوة | العملية | الحالة |
| --- | --- | --- |
| 1 | فحص تجانس root | ؟ |
| 2 | اختيار الصفة الأولى (نفترض Outlook) | ؟ |
| 3 | تقسيم subset(sunny) | ؟ |
| 4 | تقسيم subset(overcast) | ؟ |
| 5 | تقسيم subset(rain) | ؟ |

**نموذج الحل:**
| الخطوة | العملية | الحالة |
| --- | --- | --- |
| 1 | فحص تجانس root | غير متجانسة (تحوي P وN) → أكمل |
| 2 | اختيار الصفة الأولى (Outlook) | يُقسّم root إلى 3 مجموعات فرعية: sunny (5)، overcast (4)، rain (5) |
| 3 | تقسيم subset(sunny) | يحوي N,N,N,N,P → غير متجانس → يحتاج تقسيمًا إضافيًا (على Windy أو Humidity حسب البيانات الكاملة) |
| 4 | تقسيم subset(overcast) | يحوي P,P,P,P فقط → متجانس تمامًا → **ورقة = play مباشرة** |
| 5 | تقسيم subset(rain) | يحوي N,N,P,P,P → غير متجانس → يحتاج تقسيمًا إضافيًا (على Windy) |

**النتيجة:** overcast يصبح ورقة مباشرة (play)؛ sunny وrain يحتاجان تقسيمًا إضافيًا — يطابق تمامًا هيكل الشجرة الأصلية في الشكل 3.2.

### تمرين تتبع 2: تتبع مسار قرار في شجرة degrees

**المدخل:** طالب: `SoftEng=B`, `ARIN=A`, `HCI=A`, `CSA=B`, `Project=A`.

**تتبّع خطوة بخطوة (أكمل الجدول):**
| الخطوة | الصفة المُختبَرة | القيمة | النتيجة/الانتقال |
| --- | --- | --- | --- |
| 1 | SoftEng | B | ؟ |

**نموذج الحل:**
| الخطوة | الصفة المُختبَرة | القيمة | النتيجة/الانتقال |
| --- | --- | --- | --- |
| 1 | SoftEng | B | ينتقل مباشرة إلى ورقة SECOND (لا حاجة لفحص أي صفة أخرى) |

**النتيجة:** SECOND — يوضّح أن فرع `SoftEng=B` هو أقصر مسار ممكن في الشجرة (طول 1 فقط)، خلافًا لمسار `SoftEng=A` الذي قد يصل لطول 4.

### تمرين تتبع 3: التحقق من Adequacy Condition

**المدخل:**
```text
Instance 1: Outlook=sunny, Windy=false, Humidity=70 → play
Instance 2: Outlook=sunny, Windy=false, Humidity=70 → don't play
```

**تتبّع خطوة بخطوة (أكمل الجدول):**
| الخطوة | الفحص | النتيجة |
| --- | --- | --- |
| 1 | مقارنة قيم كل الصفات بين Instance 1 و2 | ؟ |
| 2 | مقارنة الأصناف | ؟ |
| 3 | القرار النهائي بخصوص Adequacy Condition | ؟ |

**نموذج الحل:**
| الخطوة | الفحص | النتيجة |
| --- | --- | --- |
| 1 | مقارنة قيم كل الصفات | متطابقة تمامًا (Outlook, Windy, Humidity) |
| 2 | مقارنة الأصناف | مختلفة (play مقابل don't play) |
| 3 | القرار النهائي | **مخالفة صريحة لـ Adequacy Condition** — لا يمكن تطبيق TDIDT الأساسية مباشرة |

**النتيجة:** يجب حل التناقض (جمع صفة مميزة إضافية أو معالجة إحصائية) قبل المتابعة.

### تمرين تتبع 4: حساب أقصى طول فرع ممكن

**المدخل:** مجموعة بيانات بها M=6 صفات (بدون Class).

**تتبّع خطوة بخطوة (أكمل الجدول):**
| الخطوة | المنطق | القيمة |
| --- | --- | --- |
| 1 | كل صفة تُستخدم مرة واحدة كحد أقصى في أي فرع | ؟ |
| 2 | أقصى عدد من الصفات الممكن اختبارها في مسار واحد | ؟ |

**نموذج الحل:**
| الخطوة | المنطق | القيمة |
| --- | --- | --- |
| 1 | قيد "عدم تكرار الصفة في نفس الفرع" | يضمن كل صفة تظهر 0 أو 1 مرة فقط في أي فرع |
| 2 | أقصى طول فرع = M | = 6 |

**النتيجة:** أطول فرع ممكن نظريًا في هذه البيانات يحتوي 6 شروط (term)، وهذا هو أساس ضمان `termination` للخوارزمية.

---

## الجزء الخامس: أسئلة نظرية متوقعة بالامتحان

### السؤال 1: ما هو `TDIDT` وما الذي يميّزه كخوارزمية؟
**نموذج الإجابة:** 1. التعريف: خوارزمية "Top-Down Induction of Decision Trees" لبناء شجرة قرار عبر التقسيم التكراري (recursive partitioning). 2. المكونات/الشروط: تتطلب Adequacy Condition، وتمنع اختيار نفس الصفة مرتين في نفس الفرع. 3. مثال: تطبيقها على بيانات الغولف تنتج الشجرة في الشكل 3.2. 4. متى نستخدم: لبناء نماذج تصنيف قابلة للتفسير من بيانات تصنيفية (مع إمكانية التكيف للبيانات المستمرة).

### السؤال 2: ما هو `Adequacy Condition` ولماذا هو ضروري؟
**نموذج الإجابة:** 1. التعريف: لا يجوز وجود صفّين لهما نفس قيم كل الصفات لكن بصنف مختلف. 2. المكونات/الشروط: شرط مسبق (precondition) يجب التحقق منه قبل تطبيق TDIDT، لا خلاله. 3. مثال: حالتان بنفس Outlook/Humidity/Windy لكن إحداهما play والأخرى don't play. 4. متى نستخدم: يُفحص دائمًا أول خطوة قبل بناء أي شجرة؛ عدم تحققه يستدعي معالجة خاصة (الفصل 8).

### السؤال 3: اشرح الفرق بين `categorical` و`continuous attributes` وأثره على `splitting`.
**نموذج الإجابة:** 1. التعريف: categorical لها مجموعة قيم منتهية وصغيرة، continuous لها قيم رقمية. 2. المكونات: categorical تُقسَّم بفرع لكل قيمة، continuous تُقسَّم بمقارنة ≤/> عند split value. 3. مثال: Outlook (categorical) بثلاثة فروع مقابل Humidity (continuous) بفرعين حول 75. 4. متى نستخدم: نوع الصفة يُحدد استراتيجية التقسيم المناسبة في أي تطبيق فعلي.

### السؤال 4: ما معنى قول النص أن TDIDT الأساسية "underspecified"؟
**نموذج الإجابة:** 1. التعريف: الخوارزمية لا تحدد طريقة اختيار الصفة في خطوة "Select an attribute A to split on". 2. المكونات: أي اختيار (حتى العشوائي) يُنتج شجرة صحيحة تقنيًا، لكن الجودة التنبؤية تتفاوت جدًا. 3. مثال: اختيار عشوائي قد يتجاهل صفة مهمة كـ Outlook ويستخدم صفة أقل فائدة أولًا. 4. متى نستخدم: يُدفع لدراسة معايير اختيار الصفة (Ch.4-5) لضمان شجرة عالية الجودة.

### السؤال 5: كيف تُشتق `decision rules` من `decision tree`؟
**نموذج الإجابة:** 1. التعريف: كل مسار من الجذر لورقة يمثل قاعدة واحدة. 2. المكونات: antecedent (شروط مرتبطة بـ AND) و consequent (الصنف). 3. مثال: مسار Outlook=rain→Windy=false→play يعطي قاعدة IF Outlook=rain AND Windy=false THEN Class=play. 4. متى نستخدم: عند الحاجة لتمثيل نصي/برمجي مباشر بدل الرسم الشجري.

### السؤال 6: وضّح الفرق بين وظيفتي الشجرة: data compression و prediction.
**نموذج الإجابة:** 1. التعريف: compression = تمثيل أكثر إيجازًا لنفس بيانات training set؛ prediction = التنبؤ بتصنيف حالات جديدة. 2. المكونات: compression تُقاس بعدد المصطلحات (terms)، prediction تُقاس بالدقة على test set. 3. مثال: 130 مصطلحًا → 14 (compression)؛ تصنيف يوم غير مرئي (prediction). 4. متى نستخدم: كلا الوظيفتين متلازمتان في أي شجرة مبنية جيدًا.

### السؤال 7: عرّف أنواع الاستدلال الثلاثة ووضّح أيها يصف بناء أشجار القرار.
**نموذج الإجابة:** 1. التعريف: deduction (يقيني)، abduction (تفسير غير مؤكد)، induction (تعميم من ملاحظات). 2. المكونات: كل نوع له بنية منطقية مختلفة كما في الأمثلة الثلاثة بالنص. 3. مثال: بناء شجرة الغولف من 14 يومًا هو induction. 4. متى نستخدم: التمييز مهم لفهم أن نتائج شجرة القرار احتمالية وليست يقينية.

### السؤال 8: لماذا لا تستخدم بعض الأشجار كل الصفات المتوفرة في البيانات؟
**نموذج الإجابة:** 1. التعريف: TDIDT تختار فقط الصفات التي تساهم في فصل الأصناف بالفعل. 2. المكونات: صفة غير مميِّزة لا تُختار في أي عقدة. 3. مثال: Temperature في الغولف وHCI في degrees. 4. متى نستخدم: يُفسّر لماذا حجم الشجرة قد يكون أصغر بكثير من عدد الصفات الكلي.

### السؤال 9: ما أهمية القيد "عدم اختيار نفس الصفة مرتين في نفس الفرع"؟
**نموذج الإجابة:** 1. التعريف: كل صفة تظهر 0 أو 1 مرة كحد أقصى في أي مسار من الجذر لورقة. 2. المكونات: يمنع التكرار العبثي، ويضمن حدًا أقصى لطول الفرع = M. 3. مثال: فرع "SoftEng=A AND Project=B..." لا يجوز فيه إعادة اختبار SoftEng. 4. متى نستخدم: يُذكر عند إثبات ضمان انتهاء (termination) خوارزمية TDIDT.

### السؤال 10: صف بإيجاز خوارزمية TDIDT الأساسية بصيغة IF...THEN...ELSE.
**نموذج الإجابة:** 1. التعريف: IF كل الحالات بنفس الصنف THEN أرجع الصنف؛ ELSE اختر صفة، قسّم، وكرر تكراريًا على كل فرع. 2. المكونات: شرط الإيقاف (تجانس) + خطوة الاختيار + خطوة الفرز + الاستدعاء الذاتي. 3. مثال: تطبيقها المتدرج على subset(sunny) في مثال الغولف. 4. متى نستخدم: الصيغة العامة القابلة للتخصيص بمعايير اختيار مختلفة لاحقًا.

### السؤال 11: ما الفرق بين branch و leaf node و internal node؟
**نموذج الإجابة:** 1. التعريف: branch = مسار/رابط بين عقدتين يمثل قيمة صفة؛ leaf = عقدة نهائية تحمل تصنيفًا؛ internal node = عقدة اختبار وسيطة (ليست جذرًا ولا ورقة). 2. المكونات: الشجرة = مجموعة عقد مرتبطة بفروع تنتهي بأوراق. 3. مثال: Humidity هي internal node، play/don't play أوراق، والرابط "sunny" فرع. 4. متى نستخدم: أساسي لقراءة أي شجرة قرار واستخراج القواعد منها.

### السؤال 12: علاقة data compression بحجم training set — وضّح بمثال رقمي.
**نموذج الإجابة:** 1. التعريف: كلما زاد عدد الصفوف والصفات، زاد عدد المصطلحات إذا عاملنا كل صف كقاعدة مستقلة. 2. المكونات: terms_if_flat = عدد الصفوف × عدد الصفات. 3. مثال: 26 صفًا × 5 صفات = 130، مقابل 14 مصطلحًا فقط في الشجرة، أي ضغط ≈90%. 4. متى نستخدم: مؤشر كمي بسيط لتقييم "إيجاز" أي شجرة قرار.

---

## الجزء السادس: ورقة المراجعة السريعة (Cheat Sheet)

### 🔑 خريطة العلاقات بين المحاضرات
| المحاضرة | ترتبط مع | كيف؟ |
| --- | --- | --- |
| هذه المحاضرة (Decision Trees / TDIDT) | Statistical Machine Learning (K-NN, Random Forest) | التمثيل الشجري أساس لاحقًا لـ `bagging`/`boosting`/`random forest` |
| هذه المحاضرة | Classification | مقياس الأداء (confusion matrix، accuracy) يُطبَّق على تنبؤات الشجرة |
| هذه المحاضرة | الفصول 4 و5 (لاحقًا) | تحديد معيار اختيار الصفة (attribute selection) لسد ثغرة "underspecified" |

### 🔑 أهم النقاط الذهبية
| الموضوع | النقاط |
| --- | --- |
| بناء الشجرة | TDIDT = recursive partitioning حتى تجانس كل ورقة |
| قيد أساسي | لا تكرار لنفس الصفة في نفس الفرع → يضمن termination |
| شرط مسبق | Adequacy Condition يجب التحقق منه أولًا |
| نوع الاستدلال | induction — تعميم احتمالي وليس يقينًا |
| الصفات غير المستخدمة | طبيعي ألا تظهر كل الصفات في الشجرة النهائية |

### 🔑 مرجع سريع
| الرمز/المصطلح | المعنى | يُستخدم في |
| --- | --- | --- |
| `M` | عدد الصفات الكلي | حساب أقصى طول فرع |
| `≤ / >` | معيار تقسيم continuous attribute | Humidity ≤ 75 |
| `DNF` | Disjunctive Normal Form | تمثيل مجموعة القواعد |
| `antecedent` | الشروط في يسار القاعدة | SoftEng=A AND ... |

### 🔑 قواعد ذهبية لا تُنسى
| # | القاعدة |
| --- | --- |
| 1 | تحقق من Adequacy Condition **قبل** أي تطبيق لـ TDIDT |
| 2 | لا تُكرر اختبار نفس الصفة في نفس الفرع أبدًا |
| 3 | غياب صفة عن الشجرة لا يعني أنها بلا قيمة، فقط أنها غير مميِّزة في هذه البيانات |
| 4 | الشجرة تنبؤ (induction) وليست حقيقة يقينية (deduction) |
| 5 | decision tree ≡ decision rules دائمًا، تمثيلان لنفس المنطق |

---

## الجزء الرابع: بطاقات سؤال وجواب (Q&A Cards)

**Q1:** ما اختصار TDIDT؟
A: Top-Down Induction of Decision Trees.

**Q2:** كم عدد الحالات (instances) في مثال الغولف؟
A: 14 حالة (يومان أسبوعيان).

**Q3:** كم عدد الحالات في مجموعة بيانات degrees؟
A: 26 حالة.

**Q4:** ما الصفة التي لم تُستخدم في شجرة الغولف؟
A: Temperature.

**Q5:** ما الصفة التي لم تُستخدم في شجرة degrees؟
A: HCI.

**Q6:** ما هو Adequacy Condition؟
A: لا يجوز أن يكون لصفّين نفس قيم كل الصفات لكن بصنف مختلف.

**Q7:** ما القيد على اختيار الصفة في نفس الفرع؟
A: لا يجوز اختيار نفس الصفة مرتين في نفس الفرع.

**Q8:** ما أقصى طول ممكن لأي فرع إذا كان عدد الصفات M؟
A: M (كحد أقصى).

**Q9:** ما الفرق بين categorical وcontinuous attribute؟
A: categorical قيم محدودة (تفرّع لكل قيمة)، continuous قيم رقمية (تفرّع بـ ≤/>).

**Q10:** ماذا تعني DNF؟
A: Disjunctive Normal Form — مجموعة قواعد IF...THEN مرتبطة منطقيًا بـ OR.

**Q11:** ما نوع الاستدلال المنطقي وراء بناء شجرة القرار من البيانات؟
A: induction (استقراء).

**Q12:** ما الفرق بين deduction وabduction؟
A: deduction نتيجة يقينية من مقدمات صحيحة، abduction نتيجة متسقة لكن غير مؤكدة.

**Q13:** لماذا وُصفت TDIDT الأساسية بأنها underspecified؟
A: لأنها لا تحدد طريقة اختيار الصفة عند كل انقسام.

**Q14:** كم كانت نسبة ضغط البيانات (compression) في مثال degrees؟
A: تقريبًا 90% (14 مصطلحًا بدل 130).

**Q15:** من هو العالم الذي طوّر تطبيقات ضخمة لتوليد القواعد آليًا مقارنة بـMYCIN وXCON؟
A: Donald Michie.

**Q16:** ماذا يُسمى المسار من الجذر إلى ورقة؟
A: branch (فرع)، ويقابل قاعدة تصنيف واحدة.

**Q17:** هل الشجرة تضمن تنبؤًا صحيحًا 100% على unseen instances؟
A: لا، فهي تنبؤ احتمالي وليس يقينًا مطلقًا.

---

## الجزء الخامس: الكود النهائي (مرجع شامل)

> الكود الكامل مجمّع من جميع أجزاء المحاضرة في ملفين منفصلين — مرجع للطالب، لا شرح جديد. (شرح زيادة للفهم: هذا تطبيق عملي لمفاهيم الفصل النظري على بيانات الغولف باستخدام مكتبات فعلية.)

```r
# === script.R ===
# TDIDT concept demo using rpart on the Golf dataset

# Import required library
library(rpart)  # provides a TDIDT-style CART implementation

# Recreate the Golf training set (14 instances)
golf <- data.frame(
  Outlook = c("sunny","sunny","sunny","sunny","sunny",
              "overcast","overcast","overcast","overcast",
              "rain","rain","rain","rain","rain"),
  Temperature = c(75,80,85,72,69,72,83,64,81,71,65,75,68,70),
  Humidity = c(70,90,85,95,70,90,78,65,75,80,70,80,80,96),
  Windy = c(TRUE,TRUE,FALSE,FALSE,FALSE,TRUE,FALSE,TRUE,FALSE,
            TRUE,TRUE,FALSE,FALSE,FALSE),
  Class = c("play","dontplay","dontplay","dontplay","play",
            "play","play","play","play","dontplay","dontplay",
            "play","play","play")
)

# Fit a decision tree (TDIDT-based) on the full training set
tree_model <- rpart(Class ~ Outlook + Temperature + Humidity + Windy,
                     data = golf, method = "class")

# Predict for a new (unseen) instance: sunny, 74F, 77%, false
new_day <- data.frame(Outlook = "sunny", Temperature = 74,
                       Humidity = 77, Windy = FALSE)
prediction <- predict(tree_model, new_day, type = "class")
print(prediction)  # Expected: dontplay (Humidity > 75 branch)
```

```python
# === script.py ===
# TDIDT concept demo using scikit-learn's DecisionTreeClassifier

import pandas as pd  # data handling
from sklearn.tree import DecisionTreeClassifier  # TDIDT-based CART model
from sklearn.preprocessing import LabelEncoder  # encode categorical attrs

# Recreate the Golf training set (14 instances)
golf = pd.DataFrame({
    "Outlook": ["sunny","sunny","sunny","sunny","sunny",
                "overcast","overcast","overcast","overcast",
                "rain","rain","rain","rain","rain"],
    "Temperature": [75,80,85,72,69,72,83,64,81,71,65,75,68,70],
    "Humidity": [70,90,85,95,70,90,78,65,75,80,70,80,80,96],
    "Windy": [True,True,False,False,False,True,False,True,False,
              True,True,False,False,False],
    "Class": ["play","dontplay","dontplay","dontplay","play",
              "play","play","play","play","dontplay","dontplay",
              "play","play","play"]
})

# Encode the categorical Outlook attribute as integers
le_outlook = LabelEncoder()
golf["Outlook_enc"] = le_outlook.fit_transform(golf["Outlook"])

# Prepare feature matrix X and target vector y
X = golf[["Outlook_enc", "Temperature", "Humidity", "Windy"]]
y = golf["Class"]

# Fit the decision tree classifier (TDIDT-style induction)
clf = DecisionTreeClassifier(random_state=0)
clf.fit(X, y)

# Predict for a new (unseen) instance: sunny, 74F, 77%, false
new_day = pd.DataFrame({
    "Outlook_enc": le_outlook.transform(["sunny"]),
    "Temperature": [74],
    "Humidity": [77],
    "Windy": [False]
})
print(clf.predict(new_day))  # Expected: ['dontplay']
```

---

## الجزء السادس: قائمة فحص ذاتي قبل الامتحان ✅

- [ ] أستطيع شرح خوارزمية TDIDT خطوة بخطوة من الذاكرة
- [ ] أفهم الفرق بين categorical وcontinuous attribute وأثره على splitting
- [ ] أستطيع اشتقاق decision rules كاملة من أي شجرة معطاة
- [ ] أفهم Adequacy Condition وأستطيع تحديد مخالفته في مثال معطى
- [ ] أفهم لماذا قيد "عدم تكرار الصفة في نفس الفرع" يضمن termination
- [ ] أميّز بين deduction وabduction وinduction بأمثلة
- [ ] أفهم معنى "underspecified" في سياق TDIDT الأساسية
- [ ] أستطيع حساب نسبة data compression لأي مثال رقمي
- [ ] أستطيع تتبع مسار حالة جديدة عبر شجرة قرار للوصول لتصنيفها
- [ ] أفهم الفرق بين training set وtest set/unseen instances
- [ ] راجعت جميع بطاقات Q&A دون الرجوع للحل أولًا
- [ ] حللت جميع أسئلة MCQ الـ20 وراجعت تعليل كل خيار خاطئ

---
<!-- VALIDATION: schema_version=1.0 | source=Chapter 3 - Decision Trees for Classification (TDIDT) | sections=integration_map,detail,summary,mcq(20),debug(6),extra_exercises(6),analysis_exercises(4),trace_exercises(4),theory(12),qa_cards(17),reference_code(R+Python),cheat_sheet,self_check | lang=ar+en_terms -->
