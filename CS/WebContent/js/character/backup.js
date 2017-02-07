var myApp = angular.module("CharacterSheetApp", ["ngAnimate","chartDirective"]);
myApp.directive('numericbinding', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            model: '=ngModel',
        },                
        link: function (scope, element, attrs, ngModelCtrl) {
           if (scope.model && typeof scope.model == 'string') {
               scope.model = parseInt(scope.model);
           } 
           scope.$watch('model', function(val, old) {
               if (typeof val == 'string') {
                   scope.model = parseInt(val);
               }
           });                 
       }
   };
});
myApp.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});
myApp.directive('focusOnShow', function($timeout) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attr) {
            if ($attr.ngShow){
                $scope.$watch($attr.ngShow, function(newValue){
                    if(newValue){
                        $timeout(function(){
                            $element[0].focus();
                        }, 0);
                    }
                })      
            }
            if ($attr.ngHide){
                $scope.$watch($attr.ngHide, function(newValue){
                    if(!newValue){
                        $timeout(function(){
                            $element[0].focus();
                        }, 0);
                    }
                })      
            }

        }
    };
})
myApp.animation('.slide-toggle', ['$animateCss', function($animateCss) {
    var lastId = 0;
    var _cache = {};

    function getId(el) {
        var id = el[0].getAttribute("data-slide-toggle");
        if (!id) {
            id = ++lastId;
            el[0].setAttribute("data-slide-toggle", id);
        }
        return id;
    }
    function getState(id) {
        var state = _cache[id];
        if (!state) {
            state = {};
            _cache[id] = state;
        }
        return state;
    }

    function generateRunner(closing, state, animator, element, doneFn) {
        return function() {
            state.animating = true;
            state.animator = animator;
            state.doneFn = doneFn;
            animator.start().finally(function() {
                if (closing && state.doneFn === doneFn) {
                    element[0].style.height = '';
                }
                state.animating = false;
                state.animator = undefined;
                state.doneFn();
            });
        }
    }

    return {
        addClass: function(element, className, doneFn) {
            if (className == 'ng-hide') {
                var state = getState(getId(element));
                var height = (state.animating && state.height) ? 
                state.height : element[0].offsetHeight;

                var animator = $animateCss(element, {
                    from: {height: height + 'px', opacity: 1},
                    to: {height: '0px', opacity: 0}
                });
                if (animator) {
                    if (state.animating) {
                        state.doneFn = 
                        generateRunner(true, 
                           state, 
                           animator, 
                           element, 
                           doneFn);
                        return state.animator.end();
                    }
                    else {
                        state.height = height;
                        return generateRunner(true, 
                          state, 
                          animator, 
                          element, 
                          doneFn)();
                      }
                  }
              }
              doneFn();
          },
          removeClass: function(element, className, doneFn) {
            if (className == 'ng-hide') {
                var state = getState(getId(element));
                var height = (state.animating && state.height) ?  
                state.height : element[0].offsetHeight;

                var animator = $animateCss(element, {
                    from: {height: '0px', opacity: 0},
                    to: {height: height + 'px', opacity: 1}
                });

                if (animator) {
                    if (state.animating) {
                        state.doneFn = generateRunner(false, 
                          state, 
                          animator, 
                          element, 
                          doneFn);
                        return state.animator.end();
                    }
                    else {
                        state.height = height;
                        return generateRunner(false, 
                          state, 
                          animator, 
                          element, 
                          doneFn)();
                      }
                  }
              }
              doneFn();
          }
      };
  }]);
myApp.controller("CharacterSheetController",  function ($scope,$http) {
    $http.get('/JSON/myNewCharacterJSON.json').success(function(data) {
                $scope.data=angular.fromJson(data);
                $scope.Stats = $scope.data.Stats;
                $scope.CharacterSkills = $scope.data.CharacterSkills;
                $scope.Perks = $scope.data.Perks;
                $scope.Vitality = $scope.data.Vitality;
                
                
           
//general variables
$scope.edit;

$scope.editModifiers;

$scope.healthMultiplierInput;

$scope.healthMultiplierInput=1;

$scope.healthMultiplier;

$scope.healthMultiplier=1;
//experience
$scope.totalCharacterExperience= new Number();

$scope.totalCharacterExperience =14000;

$scope.updateExp;

$scope.skillCost = 100;

$scope.PerkCost = 500;

$scope.toSpendCharacterExperience= new Number();

$scope.toSpendCharacterExperience=0;
//Modifiers
$scope.GlobalModifirers;

$scope.GlobalModifiers =0;

$scope.ModifiersTable= new Map();

$scope.VitalityModifierTable = new Map();

$scope.VitalityModifierTable['Total']=0;

//Experience
$scope.TotalStatsUsedExperience;

$scope.ExperienceTable= new Map();

$scope.currentSumStatisticTable= new Map();

$scope.statMaxValue=new Map();

$scope.StatisticExperienceTableHelp=new Map();
//Secondary stats
$scope.SecondaryStats=new Map();
//tabela częsci ciała do znajdowania obiektu po nazwie potrzebna do layoutu
$scope.BodyPartTable = new Map();

//skill test
$scope.testResultTable = new Map();

$scope.testSuccesTable = new Map();
//Json to maps
$scope.StatsTable = new Map();

$scope.VitalityTable = new Map();

$scope.MainStatsTable = new Map();

$scope.DerivativeStatsTable = new Map();

$scope.SkillTable = new Map();

$scope.PerksTable = new Map();

$scope.PerkCount = new Map();

angular.forEach($scope.Stats,function(value,key) {

    $scope.MainStatsTable[value.mainStatistic.mainStatisticName]=value.mainStatistic;

    angular.forEach(value.mainStatistic.derivativeStats,function(v1,k1){
    $scope.DerivativeStatsTable[v1.derivativeStatistic.derivativeStatisticName]=v1.derivativeStatistic;

    });
}); 
        //Tabs
        $scope.tabShow = new Map();
       
        
        $scope.tabShowFn = function(passedNumber){
            for(i=0;i<3;i++){
                $scope.tabShow[i]=false;
                $scope.tabShow[passedNumber]=true;
               
            };
        };
//Wywoływane funkcje własne  
    //Funkcja modyfikator żywotności

    $scope.countBodyPartHealth = function (){
        $scope.VitalityModifierTable['Total']=0;
        angular.forEach($scope.Vitality.BodyParts,function(value,key) {
        switch (true){
            case (value.BodyPart.percentage<=0.75 && value.BodyPart.percentage>0.5):
                $scope.VitalityModifierTable[value.BodyPart.bodyPartName]=-2;
                break;
            case (value.BodyPart.percentage<=0.5 && value.BodyPart.percentage>0.15):
                $scope.VitalityModifierTable[value.BodyPart.bodyPartName]=-4;
                break;
            case (value.BodyPart.percentage<=0.15):
                $scope.VitalityModifierTable[value.BodyPart.bodyPartName]=-6;
                break;
            default:
                $scope.VitalityModifierTable[value.BodyPart.bodyPartName]=0;
                break;
            };
            $scope.VitalityModifierTable['Total']+=$scope.VitalityModifierTable[value.BodyPart.bodyPartName];


            });
        };
        //zwijanie stat
        $scope.editable=function(){
            $scope.edit=!$scope.edit;
        };

        //Dodawanie doświadczenia

        $scope.updateExperience=function(){
            $scope.totalCharacterExperience+=$scope.updateExp;
            $scope.countExpToSpend();
            $scope.countMaxStatToBuy();
            $scope.updateExp=0;
        };
        //Mnożenie żywotności
        $scope.healthMultiply=function(){
        $scope.healthMultiplier=$scope.healthMultiplierInput;
        angular.forEach($scope.Vitality.BodyParts,function(value,key) {
            value.BodyPart.currentPoints=Math.floor(value.BodyPart.maxPoints*value.BodyPart.percentage*$scope.healthMultiplier);
            $scope.BodyPartTableUpdate(value.BodyPart);
            
        });
        

        };
        //update Vitality z hash mapy na obiekt
        $scope.healthChange= function (){
            angular.forEach($scope.Vitality.BodyParts,function(value,key) {
                value.BodyPart.percentage=value.BodyPart.currentPoints/value.BodyPart.maxPoints;
                if(value.BodyPart.percentage>=1){
                    value.BodyPart.percentage=1;
                };
                $scope.BodyPartTableUpdate(value.BodyPart);
               
            });
        };
        //funkcja do updatu tabeli z częściami ciała

        $scope.BodyPartTableUpdate= function (updatedBodyPart){
            $scope.BodyPartTable[updatedBodyPart.bodyPartName]=updatedBodyPart;
        };

        //obliczanie bonusu do staty głównej z derywaty
        $scope.sumDerivativeStats= function (passedMainStat){
            $scope.bonusTable[passedMainStat.mainStatisticName]=0;            
            angular.forEach(passedMainStat.derivativeStats, function(value,key){            
                value.derivativeStatistic.derivativeStatisticValue=parseInt(value.derivativeStatistic.derivativeStatisticValue);
                $scope.bonusTable[passedMainStat.mainStatisticName] += value.derivativeStatistic.derivativeStatisticValue;
               // console.log(value.derivativeStatistic.derivativeStatisticName+': '+value.derivativeStatistic.derivativeStatisticValue);
            });

        };

         $scope.countBonus= function (passedMainStatisticName){

                $scope.bonusTable[passedMainStatisticName] = Math.floor($scope.bonusTable[passedMainStatisticName]/4);                
                //console.log($scope.bonusTable[passedMainStatisticName]);
        };
        $scope.CountExp = function (StatisticName,StatisticValue,multiplier){
            $scope.ExperienceTable[StatisticName]=0; 
            StatisticValue=parseInt(StatisticValue);
            $scope.ExperienceTable[StatisticName]=(multiplier*(Math.pow(StatisticValue,2)+StatisticValue))/2; 

            //console.log('mult: '+multiplier+' stat: '+Math.pow(StatisticValue,2));
            //console.log($scope.ExperienceTable[StatisticName]);        

            $scope.TotalStatsUsedExperience=0;
           
            angular.forEach($scope.Stats,function(value,key) {
                        $scope.TotalStatsUsedExperience+=parseInt($scope.ExperienceTable[value.mainStatistic.mainStatisticName]);
                        
                    angular.forEach(value.mainStatistic.derivativeStats,function(v1,k1) {
                        $scope.TotalStatsUsedExperience+=parseInt($scope.ExperienceTable[v1.derivativeStatistic.derivativeStatisticName]);
                        
                 });
                });
            $scope.TotalStatsUsedExperience+=$scope.CharacterSkills.length*$scope.skillCost+$scope.Perks.length*$scope.PerkCost;
        };
        //Obliczanie expa wydanego na wszystkie staty i skille
            $scope.StatisticExpCount= function (){
                    
            angular.forEach($scope.Stats,function(value,key) {
                    
                    $scope.ExperienceTable[value.mainStatistic.mainStatisticName]=0;
                    
                    $scope.ExperienceTable[value.mainStatistic.mainStatisticName]=(80*(Math.pow(value.mainStatistic.mainStatisticValue,2)+value.mainStatistic.mainStatisticValue))/2;
                    
            angular.forEach(value.mainStatistic.derivativeStats,function(v1,k1){
                    v1.derivativeStatistic.derivativeStatisticValue = parseInt(v1.derivativeStatistic.derivativeStatisticValue);
                    $scope.ExperienceTable[v1.derivativeStatistic.derivativeStatisticName]=0;
                    $scope.ExperienceTable[v1.derivativeStatistic.derivativeStatisticName]=40*(Math.pow(v1.derivativeStatistic.derivativeStatisticValue,2)+v1.derivativeStatistic.derivativeStatisticValue)/2;
                });
            });
            $scope.TotalStatsUsedExperience=0;
           
            angular.forEach($scope.Stats,function(value,key) {
                        $scope.TotalStatsUsedExperience+=parseInt($scope.ExperienceTable[value.mainStatistic.mainStatisticName]);
                        //console.log($scope.ExperienceTable[value.mainStatistic.mainStatisticName]);
                        
                    angular.forEach(value.mainStatistic.derivativeStats,function(v1,k1) {
                        $scope.TotalStatsUsedExperience+=parseInt($scope.ExperienceTable[v1.derivativeStatistic.derivativeStatisticName]);
                        //console.log($scope.ExperienceTable[value.mainStatistic.mainStatisticName]);
                 });
                });
            $scope.TotalStatsUsedExperience+=$scope.CharacterSkills.length*$scope.skillCost;
      
        };
        //Obliczanie expa do wydania
             $scope.countExpToSpend = function (){
                $scope.toSpendCharacterExperience=$scope.totalCharacterExperience-$scope.TotalStatsUsedExperience;
                //console.log('tce'+$scope.totalCharacterExperience);
                //console.log('tsue'+$scope.TotalStatsUsedExperience);
             };

        //Funkcja obliczająca Staty drugorzędne
        $scope.SecondaryStatEvaluate= function (passedSecondaryStatName,passedMainStatisticValue,passedMainStatisticName){
                    switch(passedSecondaryStatName) {
                                case 'Vitality':
                                $scope.SecondaryStats[passedSecondaryStatName]=(passedMainStatisticValue+$scope.bonusTable[passedMainStatisticName])*3;
                                
                                break;

                                default:
                                $scope.SecondaryStats[passedSecondaryStatName]=Math.floor((passedMainStatisticValue+$scope.bonusTable[passedMainStatisticName])/4);
                            };
        };
        //Obliczam jaką maksymalnie mogę kupić statystykę
        $scope.countMaxStatToBuy = function (){
                $scope.statMaxValue = new Map();
            angular.forEach($scope.Stats,function(value,key) {
                    $scope.statMaxValue[value.mainStatistic.mainStatisticName]=Math.floor((-2*value.mainStatistic.mainStatisticValue-1+Math.sqrt(4*Math.pow(value.mainStatistic.mainStatisticValue,2)+4*value.mainStatistic.mainStatisticValue+1+(8*($scope.toSpendCharacterExperience))/80))/2); 
                angular.forEach(value.mainStatistic.derivativeStats,function(v1,k1) {
                    $scope.statMaxValue[v1.derivativeStatistic.derivativeStatisticName]=Math.floor((-2*v1.derivativeStatistic.derivativeStatisticValue-1+Math.sqrt(4*Math.pow(v1.derivativeStatistic.derivativeStatisticValue,2)+4*v1.derivativeStatistic.derivativeStatisticValue+1+(8*($scope.toSpendCharacterExperience))/40))/2); 
                    });
                });
                //console.log(passedStatName);
                //console.log('MaxValue :'+$scope.statMaxValue[passedStatName]);
                
                //passedStatValue = parseInt(passedStatValue);
                //$scope.statMaxValue[passedStatName]=Math.floor((-2*passedStatValue-1+Math.sqrt(4*Math.pow(passedStatValue,2)+4*passedStatValue+1+(8*($scope.toSpendCharacterExperience))/ExperienceCost))/2); 
                //console.log('toSpendCharacterExperience :'+ $scope.toSpendCharacterExperience);
                //console.log('PassedStatvalue :'+passedStatValue);
                //console.log('MaxValue :'+$scope.statMaxValue[passedStatName]);
        };

        //Obliczanie życia z proporcji po zmianie vitality
        $scope.UpdateHealthPoints = function (passedBodyPart){
            passedBodyPart.maxPoints=Math.floor($scope.SecondaryStats['Vitality']*passedBodyPart.bodyPartMultiplier);
            passedBodyPart.currentPoints=Math.round(passedBodyPart.maxPoints*passedBodyPart.percentage);
        };
        //Obliczanie obecnych sum dla stat
        $scope.countCurrentStatSum = function(statType,passedMainStat,passedDerivativeStat){
                $scope.GlobalModifiers = parseInt($scope.GlobalModifiers);
                $scope.bonusTable[passedMainStat.mainStatisticName] =parseInt($scope.bonusTable[passedMainStat.mainStatisticName]);
                $scope.MainStatsTable[passedMainStat.mainStatisticName].mainStatisticValue =parseInt($scope.MainStatsTable[passedMainStat.mainStatisticName].mainStatisticValue);
                $scope.MainStatsTable[passedMainStat.mainStatisticName].mainStatisticModifier =parseInt($scope.MainStatsTable[passedMainStat.mainStatisticName].mainStatisticModifier);
                $scope.VitalityModifierTable['Total'] = parseInt($scope.VitalityModifierTable['Total']);
                passedDerivativeStat.derivativeStatisticValue=parseInt(passedDerivativeStat.derivativeStatisticValue);
                passedDerivativeStat.derivativeStatisticModifier=parseInt(passedDerivativeStat.derivativeStatisticModifier);
            
            if(statType==='Main'){
                
                $scope.currentSumStatisticTable[passedMainStat.mainStatisticName]=($scope.GlobalModifiers+$scope.bonusTable[passedMainStat.mainStatisticName]+$scope.MainStatsTable[passedMainStat.mainStatisticName].mainStatisticValue+$scope.MainStatsTable[passedMainStat.mainStatisticName].mainStatisticModifier+$scope.VitalityModifierTable['Total']);
                
                
                
                }else{
                
                $scope.currentSumStatisticTable[passedDerivativeStat.derivativeStatisticName]=(passedDerivativeStat.derivativeStatisticValue+$scope.MainStatsTable[passedMainStat.mainStatisticName].mainStatisticValue+$scope.GlobalModifiers+$scope.bonusTable[passedMainStat.mainStatisticName]+passedMainStat.mainStatisticModifier+$scope.VitalityModifierTable['Total']+passedDerivativeStat.derivativeStatisticModifier);
                //console.log(passedDerivativeStat.derivativeStatisticName+': '+$scope.currentSumStatisticTable[passedDerivativeStat.derivativeStatisticName]);
                
            };
        };
        //Obliczanie testów
            $scope.UpdateSkills= function(){
                    angular.forEach($scope.CharacterSkills,function(value,key){
                        value.Skill.TestValue=0;  
                        angular.forEach(value.Skill.StatsTested,function(v1,k1){

                            $scope.currentSumStatisticTable[v1.TestedStatName]=$scope.currentSumStatisticTable[v1.TestedStat.TestedStatName];
                            v1.TestedStat.TestedStatMultiplier=v1.TestedStat.TestedStatMultiplier;

                            
                            value.Skill.TestValue+=$scope.currentSumStatisticTable[v1.TestedStat.TestedStatName]*v1.TestedStat.TestedStatMultiplier;
                            //console.log($scope.currentSumStatisticTable[v1.TestedStat.TestedStatName]+' | '+v1.TestedStat.TestedStatMultiplier);
                            
                            if((k1+1)==value.Skill.StatsTested.length){
                                value.Skill.TestValue=Math.round(value.Skill.TestValue);    
                            };                        
                        });
                    });
            //if(passedDerivativeStat.derivativeStatisticName===passedTestedStat.TestedStatName){
            //passedSkill.TestValue+=$scope.currentSumStatisticTable[passedDerivativeStat.derivativeStatisticName]*passedTestedStat.TestedStatMultiplier;
            //passedSkill.TestValue=Math.floor(passedSkill.TestValue);
            //console.log('Skill TestValue: '+passedSkill.TestValue);
            //console.log('CurrentSum: '+$scope.currentSumStatisticTable[passedDerivativeStat.derivativeStatisticName]);
            //console.log('Tested StatMultiplier: '+passedTestedStat.TestedStatMultiplier);
            
        };

        $scope.CountPerks=function(){
            $scope.PerkCount = new Map();
            angular.forEach($scope.CharacterSkills,function(value,key){
                angular.forEach(value.Skill.StatsTested,function(v1,k1){
                    v1.TestedStat.TestedStatMultiplier=0.5;
                });
            });
            angular.forEach($scope.Perks,function(value,key){
                
                angular.forEach($scope.SkillTable[value.Perk.AssociatedSkill].StatsTested,function(v1,k1){
                    v1.TestedStat.TestedStatMultiplier+=value.Perk.TestAddition;
                    v1.TestedStat.TestedStatMultiplier=Math.round(v1.TestedStat.TestedStatMultiplier*10)/10;
                });

            });
        }; 



        //Tests
        $scope.RollDice = function (passedSkillName,passedSkill){
            $scope.testResultTable[passedSkillName]=Math.ceil(Math.random()*10)+Math.ceil(Math.random()*10);
            $scope.testSuccesTable[passedSkillName]=passedSkill.TestValue-$scope.testResultTable[passedSkillName];
            //console.log(passedSkillName+': '+$scope.testSuccesTable[passedSkillName]+' | '+passedSkill.TestValue+' | '+$scope.testResultTable[passedSkillName])
        };
        //Wywalenie pętli
        $scope.MainStatChange = function(passedMainStatistic){
            
            
            $scope.CountExp(passedMainStatistic.mainStatisticName,passedMainStatistic.mainStatisticValue,80);
            $scope.countExpToSpend();
            
            

            $scope.countMaxStatToBuy(); 
            angular.forEach(passedMainStatistic.derivativeStats,function(value,key) {
                $scope.countCurrentStatSum('Derivative',passedMainStatistic,value.derivativeStatistic);
                $scope.CountExp(value.derivativeStatistic.derivativeStatisticName,value.derivativeStatistic.derivativeStatisticValue,40);
                $scope.countExpToSpend();
                
            });
            $scope.sumDerivativeStats(passedMainStatistic);
            $scope.countBonus(passedMainStatistic.mainStatisticName);
            $scope.countMaxStatToBuy(passedMainStatistic.mainStatisticName,passedMainStatistic.mainStatisticValue,80); 
            $scope.countCurrentStatSum('Main',passedMainStatistic,0);
            $scope.SecondaryStatEvaluate(passedMainStatistic.secondaryStatName,passedMainStatistic.mainStatisticValue,passedMainStatistic.mainStatisticName);
            $scope.UpdateSkills();
            
            
            

        };

        $scope.DerivativeStatChange = function(passedMainStatistic,passedDerivativeStatistic){
            
            
            
            $scope.CountExp(passedDerivativeStatistic.derivativeStatisticName,passedDerivativeStatistic.derivativeStatisticValue,40);             
            $scope.countExpToSpend();
            $scope.countMaxStatToBuy();
            
            $scope.SecondaryStatEvaluate(passedMainStatistic.secondaryStatName,passedMainStatistic.mainStatisticValue,passedMainStatistic.mainStatisticName);
            $scope.sumDerivativeStats(passedMainStatistic);
            $scope.countBonus(passedMainStatistic.mainStatisticName);
            $scope.countCurrentStatSum('Derivative',passedMainStatistic,passedDerivativeStatistic);
            $scope.UpdateSkills();
            



        };

        $scope.CountExpAfterPerkAdd=function(){
            $scope.TotalStatsUsedExperience+=$scope.PerkCost;
            $scope.countExpToSpend();
        };

        $scope.GlobalModifierChange = function(){
            angular.forEach($scope.Stats,function(value,key){
                    $scope.countCurrentStatSum('Main',value.mainStatistic,0);
                angular.forEach(value.mainStatistic.derivativeStats,function(v1,k1){
                    $scope.countCurrentStatSum('Derivative',value.mainStatistic,v1.derivativeStatistic);
                });
                $scope.UpdateSkills();
            });
            
        };

        $scope.VitalityChange = function(){
            angular.forEach($scope.Stats,function(value,key){
                    $scope.countCurrentStatSum('Main',value.mainStatistic,0);
                angular.forEach(value.mainStatistic.derivativeStats,function(v1,k1){
                    $scope.countCurrentStatSum('Derivative',value.mainStatistic,v1.derivativeStatistic);
                });

            });
        };
        $scope.MainModifierChange = function(passedMainStatistic){
                $scope.countCurrentStatSum('Main',passedMainStatistic,0);
             angular.forEach(passedMainStatistic.derivativeStats,function(value,key) {
                $scope.countCurrentStatSum('Derivative',passedMainStatistic,value.derivativeStatistic);
             });
             $scope.UpdateSkills();
        };

        $scope.derivativeModifierChange = function(passedMainStatistic,passedDerivativeStatistic){
             
                $scope.countCurrentStatSum('Derivative',passedMainStatistic,passedDerivativeStatistic); 
                $scope.UpdateSkills();           
        };

        // Class definition / constructor
        $scope.MakeNewPerk = function() {
            // console.log($scope.PerkToAdd.Perk.PerkName);
            // console.log($scope.PerkToAdd.Perk.AssociatedSkill);
            // console.log($scope.PerkToAdd.Perk.TestAddition);
            // console.log($scope.PerkToAdd.Perk.Description);
           var NewPerk={Perk : {
                            PerkName : $scope.PerkToAdd.Perk.PerkName,
                            AssociatedSkill : $scope.PerkToAdd.Perk.AssociatedSkill,
                            TestAddition : Math.round($scope.PerkToAdd.Perk.TestAddition*10)/10,
                            Description : $scope.PerkToAdd.Perk.Description
                        }
                    };

            // console.log(NewPerk.Perk.PerkName);
            // console.log(NewPerk.Perk.AssociatedSkill);
            // console.log(NewPerk.Perk.TestAddition);
            // console.log(NewPerk.Perk.Description);

            return NewPerk;
            
            };

            $scope.RemapPerks = function(){
                $scope.PerksTable = new Map();
                angular.forEach($scope.Perks,function(value,key){
                $scope.PerksTable[value.Perk.PerkName]=value.Perk;
            });
            };
        

        

        $scope.AddPerk=function (){
            
            $scope.Perks.push($scope.MakeNewPerk());

            $scope.RemapPerks();
            $scope.CountPerks();
            $scope.UpdateSkills();
            $scope.CountExpAfterPerkAdd();

            $scope.tabShowFn(1);

        }

        $scope.$watch('VitalityModifierTable',function(){
            angular.forEach($scope.Stats,function(value,key){
                    $scope.countCurrentStatSum('Main',value.mainStatistic,0);
                angular.forEach(value.mainStatistic.derivativeStats,function(v1,k1){
                    $scope.countCurrentStatSum('Derivative',value.mainStatistic,v1.derivativeStatistic);
                });
                $scope.UpdateSkills();
            });
        },true);
 
        $scope.$watch('toSpendCharacterExperience',function(){
            
            
        },true);

        $scope.$watch('DerivativeSkillsTable',function(){


        },true);

        $scope.$watch('VitalityTable',function(){

        },true);

    $scope.$watch('SecondaryStats["Vitality"]',function(){ 
    	angular.forEach($scope.Vitality.BodyParts,function(value,key) {
            $scope.UpdateHealthPoints(value.BodyPart);
            $scope.BodyPartTableUpdate(value.BodyPart);
        });
    });

//Listener żywotności
    $scope.$watch('Vitality',function(){
    	$scope.countBodyPartHealth();
    },true);




                $scope.PerkToAdd={Perk:{
                            PerkName:'',
                            AssociatedSkill:'',
                            TestAddition:0.1,
                            Description:'Random Description'
                        }
                };
 
            angular.forEach($scope.Perks,function(value,key){
                $scope.PerksTable[value.Perk.PerkName]=value.Perk;
            });
            angular.forEach($scope.CharacterSkills,function(value,key){
                $scope.SkillTable[value.Skill.SkillName]=value.Skill;
                

            });
            
            $scope.TotalStatsUsedExperience=0;
            $scope.bonusTable= new Map();
            $scope.toSpendCharacterExperience =0;
            
             angular.forEach($scope.CharacterSkills,function(v2,k2){
                        v2.Skill.TestValue=0;
                    });
            
            $scope.StatisticExpCount();
            
            angular.forEach($scope.Stats,function(value,key){
            $scope.MainStatChange(value.mainStatistic);
            $scope.MainStatChange(value.mainStatistic);
            });
            $scope.CountPerks();
            $scope.UpdateSkills();
            
            console.log($scope.tabShow[0]);
























             });

});
