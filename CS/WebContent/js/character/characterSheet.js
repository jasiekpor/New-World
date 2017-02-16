var myApp = angular.module("CharacterSheetApp", ["ngAnimate","chartDirective",'file-model','sticky','Common']);
myApp.filter('orderObjectBy', function(){
 return function(input, attribute) {
    if (!angular.isObject(input)) return input;

    var array = [];
    for(var objectKey in input) {
        array.push(input[objectKey]);
    }

    array.sort(function(a, b){
        a = parseInt(a[attribute]);
        b = parseInt(b[attribute]);
        return a - b;
    });
    return array;
 }
});

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
myApp.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);
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
myApp.controller("CharacterSheetController",['$scope','$http','$rootScope','$location', '$anchorScroll','orderObjectByFilter', function ($scope,$http,$rootScope,$location,$anchorScroll,orderObjectByFilter) {

$scope.file=null;
$scope.UpperBarVis=false;

$scope.goToAnchor = function(anchorid){
    $location.hash(anchorid);
    $anchorScroll();
};

 $scope.ReloadCharacter=function(data,$scope){

                $scope.data=angular.fromJson(data);
                $scope.Stats = $scope.data.Stats;
                $scope.CharacterSkills = $scope.data.CharacterSkills;
                $scope.Perks = $scope.data.Perks;
                $scope.Vitality = $scope.data.Vitality;
                $scope.CharacterName= $scope.data.CharacterName;
                $scope.GlobalModifiers = $scope.data.GlobalModifiers;
                $scope.healthMultiplierInput= $scope.data.healthMultiplierInput;
                $scope.totalCharacterExperience= new Number();
                $scope.totalCharacterExperience =$scope.data.totalCharacterExperience;
                $scope.Fatigue = $scope.data.Fatigue;
                
                $scope.Equipment = $scope.data.Equipment;

                $scope.Magic = $scope.data.Magic;

$scope.PerkModalVis=false;
//general variables
$scope.edit;

$scope.editModifiers;

$scope.healthMultiplier;

//filters
$scope.inputSkillNameSearch;

$scope. SkillOrder;
//experience

$scope.updateExp;

$scope.skillCost = 100;

$scope.PerkCost = 500;

$scope.toSpendCharacterExperience= new Number();

$scope.toSpendCharacterExperience=0;
//Modifiers

$scope.ModifiersTable= new Map();

$scope.VitalityModifierTable = new Map();

$scope.VitalityModifierTable['Total']=0;

//Experience
$scope.TotalUsedExperience;

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

$scope.DamageTable = new Map();

$scope.testImpedimentTable = new Map();
//Json to maps
$scope.StatsTable = new Map();

$scope.VitalityTable = new Map();

$scope.MainStatsTable = new Map();

$scope.DerivativeStatsTable = new Map();

$scope.SkillTable = new Map();

$scope.PerksTable = new Map();

$scope.PerkCount = new Map();


$scope.ArmorTable = new Map();

$scope.MeleeWeaponsTable = new Map();

$scope.RangedWeaponsTable = new Map();

$scope.MagicalItemsTable = new Map();

$scope.OtherItems = new Map();
//Magic
$scope.Magic;

$scope.MagicSchoolsTable = new Map ();
//filter functions
$scope.SetSkillOrder = function(order){
    switch (true){
            case ($scope. SkillOrder=='-'+order):
                $scope. SkillOrder=order;
                break;
            case ($scope. SkillOrder==order):
                $scope. SkillOrder='-'+order;
                break;
            default:
                $scope. SkillOrder='-'+order;                
                break;
    };
};



angular.forEach($scope.Stats,function(value,key) {

    $scope.MainStatsTable[value.mainStatistic.mainStatisticName]=value.mainStatistic;

    angular.forEach(value.mainStatistic.derivativeStats,function(v1,k1){
    $scope.DerivativeStatsTable[v1.derivativeStatistic.derivativeStatisticName]=v1.derivativeStatistic;

    });
}); 
        //Tabsswitch
        $scope.tabShow = new Map();
         for(i=0;i<3;i++){
                $scope.tabShow[i]=false;               
            };
        
        $scope.tabShowFn = function(passedNumber){
            
;           if($scope.tabShow[passedNumber]===false){
            for(i=0;i<3;i++){
                $scope.tabShow[i]=false;               
            };
            $scope.tabShow[passedNumber]=true;
        }else{
                $scope.tabShow[passedNumber]=false;
               
            };
        };
        $scope.Hider = function(passedElementToHide){
            $scope.tabShow[passedElementToHide]= !$scope.tabShow[passedElementToHide];
        };


           $scope.DownloadJSON = function() {

                                
                                $scope.data.Stats = $scope.Stats;
                                $scope.data.CharacterSkills = $scope.CharacterSkills;
                                $scope.data.Perks = $scope.Perks;
                                $scope.data.Vitality = $scope.Vitality;
                                $scope.data.CharacterName= $scope.CharacterName;
                                $scope.data.GlobalModifiers = $scope.GlobalModifiers;
                                $scope.data.healthMultiplierInput = $scope.healthMultiplierInput;
                                $scope.data.totalCharacterExperience = $scope.totalCharacterExperience; 
                                $scope.data.Fatigue = $scope.Fatigue;
                                

                                var SchinyCharacter=  angular.toJson($scope.data, true);
                                
                                var blob = new Blob([SchinyCharacter], {type: "text/text"});
                                saveAs(blob, "myNewCharacterJSON.json");
                                //saveAs(blob, fileName);
                                
                            };
                            
                         
//Wywoływane funkcje własne  
    //Funkcja modyfikator żywotności

    $scope.countBodyPartHealth = function (){
       switch (true){
            case ($scope.Vitality.VitalityPercentage<=0.75 && $scope.Vitality.VitalityPercentage>0.5):
                $scope.VitalityModifierTable['Total']=-2;
                break;
            case ($scope.Vitality.VitalityPercentage<=0.5 && $scope.Vitality.VitalityPercentage>0.15):
                $scope.VitalityModifierTable['Total']=-4;
                break;
            case ($scope.Vitality.VitalityPercentage<=0.15):
                $scope.VitalityModifierTable['Total']=-10;
                break;
            default:
                $scope.VitalityModifierTable['Total']=0;
                break;
            };

        // angular.forEach($scope.Vitality.BodyParts,function(value,key) {
        // switch (true){
        //     case (value.BodyPart.percentage<=0.75 && value.BodyPart.percentage>0.5):
        //         $scope.VitalityModifierTable[value.BodyPart.bodyPartName]=-2;
        //         break;
        //     case (value.BodyPart.percentage<=0.5 && value.BodyPart.percentage>0.15):
        //         $scope.VitalityModifierTable[value.BodyPart.bodyPartName]=-4;
        //         break;
        //     case (value.BodyPart.percentage<=0.15):
        //         $scope.VitalityModifierTable[value.BodyPart.bodyPartName]=-6;
        //         break;
        //     default:
        //         $scope.VitalityModifierTable[value.BodyPart.bodyPartName]=0;
        //         break;
        //     };
        //     $scope.VitalityModifierTable['Total']+=$scope.VitalityModifierTable[value.BodyPart.bodyPartName];


        //    });
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
            
                $scope.Vitality.VitalityPercentage= $scope.Vitality.VitalityCurrentPoints/ $scope.Vitality.VitalityMaxPoints;
                if($scope.Vitality.VitalityPercentage>=1){
                    $scope.Vitality.VitalityPercentage=1;
                };
               
               
           
        };
        $scope.AnimaPercentageCount= function (){            
                $scope.Magic.AnimaPercentage= $scope.Magic.CurrentAnima/ $scope.Magic.MaxAnima;
                if($scope.Magic.AnimaPercentage>=1){
                    $scope.Magic.AnimaPercentage=1;
                };
               
               
           
        };
         $scope.CountCurrentAnima= function (){       
            $scope.Magic.CurrentAnima = Math.round($scope.Magic.MaxAnima * $scope.Magic.AnimaPercentage);
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

            $scope.TotalUsedExperience=0;
           
            angular.forEach($scope.Stats,function(value,key) {
                        $scope.TotalUsedExperience+=parseInt($scope.ExperienceTable[value.mainStatistic.mainStatisticName]);
                        
                    angular.forEach(value.mainStatistic.derivativeStats,function(v1,k1) {
                        $scope.TotalUsedExperience+=parseInt($scope.ExperienceTable[v1.derivativeStatistic.derivativeStatisticName]);
                        
                 });
                });
            $scope.CountPerksExp();
            $scope.CountCharacterSkillsExp;
            $scope.CountMagicExp();
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
            $scope.TotalUsedExperience=0;
           
            angular.forEach($scope.Stats,function(value,key) {
                        $scope.TotalUsedExperience+=parseInt($scope.ExperienceTable[value.mainStatistic.mainStatisticName]);
                        //console.log($scope.ExperienceTable[value.mainStatistic.mainStatisticName]);
                        
                    angular.forEach(value.mainStatistic.derivativeStats,function(v1,k1) {
                        $scope.TotalUsedExperience+=parseInt($scope.ExperienceTable[v1.derivativeStatistic.derivativeStatisticName]);
                        //console.log($scope.ExperienceTable[value.mainStatistic.mainStatisticName]);
                 });
                });
            $scope.TotalUsedExperience+=$scope.CharacterSkills.length*$scope.skillCost;
      
        };
        //Obliczanie expa do wydania
             $scope.countExpToSpend = function (){
                $scope.toSpendCharacterExperience=$scope.totalCharacterExperience-$scope.TotalUsedExperience;
                //console.log('tce'+$scope.totalCharacterExperience);
                //console.log('tsue'+$scope.TotalUsedExperience);
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
                $scope.statMaxValue['MaxAnima']=Math.floor((-2*($scope.Magic.MaxAnima-$scope.Magic.minAnima)-1+Math.sqrt(4*Math.pow($scope.Magic.MaxAnima-$scope.Magic.minAnima,2)+4*($scope.Magic.MaxAnima-$scope.Magic.minAnima)+1+(8*($scope.toSpendCharacterExperience))/1))/2);
               
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
            // passedBodyPart.maxPoints=Math.floor($scope.SecondaryStats['Vitality']*passedBodyPart.bodyPartMultiplier);
            // passedBodyPart.currentPoints=Math.round(passedBodyPart.maxPoints*passedBodyPart.percentage);
            $scope.Vitality.VitalityMaxPoints = Math.floor($scope.SecondaryStats['Vitality']);
            $scope.Vitality.VitalityCurrentPoints =Math.round($scope.Vitality.VitalityMaxPoints*$scope.Vitality.VitalityPercentage);
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
        //Obliczanie testówng-show="PerkType==Skill" 
            $scope.UpdateSkills= function(){
                    angular.forEach($scope.CharacterSkills,function(value,key){
                        value.Skill.TestValue=0;  
                        angular.forEach(value.Skill.StatsTested,function(v1,k1){                   
                            value.Skill.TestValue+=$scope.currentSumStatisticTable[v1.TestedStat.TestedStatName]*v1.TestedStat.TestedStatMultiplier;
                            //console.log($scope.currentSumStatisticTable[v1.TestedStat.TestedStatName]+' | '+v1.TestedStat.TestedStatMultiplier);                            
                            if((k1+1)==value.Skill.StatsTested.length){
                                value.Skill.TestValue=Math.round(value.Skill.TestValue);    
                            };                        
                        });
                    });
            $scope.UpdateMeleeWeapons = function(){
                    angular.forEach($scope.Equipment.MeleeWeapons,function(value,key){
                        value.MeleeWeapon.TestValue=0;  
                        angular.forEach(value.MeleeWeapon.StatsTested,function(v1,k1){
                            value.MeleeWeapon.TestValue+=$scope.currentSumStatisticTable[v1.TestedStat.TestedStatName]*v1.TestedStat.TestedStatMultiplier;
                            //console.log($scope.currentSumStatisticTable[v1.TestedStat.TestedStatName]+' | '+v1.TestedStat.TestedStatMultiplier);
                            
                            if((k1+1)==value.MeleeWeapon.StatsTested.length){
                                value.MeleeWeapon.TestValue=Math.round(value.MeleeWeapon.TestValue);    
                            };                        
                        });
                    });
            };
            $scope.UpdateRangedWeapons = function(){
                    angular.forEach($scope.Equipment.RangedWeapons,function(value,key){
                        value.RangedWeapon.TestValue=0;  
                        
                        angular.forEach(value.RangedWeapon.StatsTested,function(v1,k1){
                            value.RangedWeapon.TestValue+=$scope.currentSumStatisticTable[v1.TestedStat.TestedStatName]*v1.TestedStat.TestedStatMultiplier;
                            //console.log($scope.currentSumStatisticTable[v1.TestedStat.TestedStatName]+' | '+v1.TestedStat.TestedStatMultiplier);

                            if((k1+1)==value.RangedWeapon.StatsTested.length){
                                value.RangedWeapon.TestValue=Math.round(value.RangedWeapon.TestValue);    
                            };                        
                        });
                    });
            };
            //if(passedDerivativeStat.derivativeStatisticName===passedTestedStat.TestedStatName){
            //passedSkill.TestValue+=$scope.currentSumStatisticTable[passedDerivativeStat.derivativeStatisticName]*passedTestedStat.TestedStatMultiplier;
            //passedSkill.TestValue=Math.floor(passedSkill.TestValue);
            
            
        };
        //cała funkcja do podzielenia na pare mniejszych funkcji lub cały proces dodania perka przepisać na callback
        $scope.CountPerks=function(){
            $scope.PerkCount = new Map();
            //Gdy perk dotyczy skilla 
        
                
                angular.forEach($scope.CharacterSkills,function(value,key){
                    angular.forEach(value.Skill.StatsTested,function(v1,k1){
                        v1.TestedStat.TestedStatMultiplier=v1.TestedStat.BaseTestedStatMultiplier;
                    });
                });

                angular.forEach($scope.Perks,function(value,key){
                    
                    angular.forEach($scope.SkillTable[value.Perk.AssociatedSkill].StatsTested,function(v1,k1){
                        v1.TestedStat.TestedStatMultiplier+=value.Perk.TestAddition;
                        v1.TestedStat.TestedStatMultiplier=Math.round(v1.TestedStat.TestedStatMultiplier*10)/10;
                    });

                });
            
            //Gdy perk dotyczy MeleeWeapon
                //zerowanie
                angular.forEach($scope.Equipment.MeleeWeapons,function(value,key){
                    angular.forEach(value.MeleeWeapon.StatsTested,function(v1,k1){
                        v1.TestedStat.TestedStatMultiplier=v1.TestedStat.BaseTestedStatMultiplier;
                    });
                });
                    //zamiast if powinienem tu dodac filtr
               angular.forEach($scope.Perks,function(value,key){                    
                    if(value.Perk.AssociatedSkill=='Melee Combat'){                        
                        angular.forEach($scope.Equipment.MeleeWeapons,function(v1,k1){
                            angular.forEach(v1.MeleeWeapon.StatsTested,function(v2,k2){
                                v2.TestedStat.TestedStatMultiplier+=value.Perk.TestAddition;
                                v2.TestedStat.TestedStatMultiplier=Math.round(v2.TestedStat.TestedStatMultiplier*10)/10;
                            });
                        });
                        };
                    });

            //Gdy perk dotyczy ranged Weapon
                //zerowanie
                angular.forEach($scope.Equipment.RangedWeapons,function(value,key){
                    angular.forEach(value.RangedWeapon.StatsTested,function(v1,k1){
                        v1.TestedStat.TestedStatMultiplier=v1.TestedStat.BaseTestedStatMultiplier;
                    });
                });
                    //zamiast if powinienem tu dodac filtr
                angular.forEach($scope.Perks,function(value,key){                    
                    if(value.Perk.AssociatedSkill=='Shooting'){                        
                        angular.forEach($scope.Equipment.RangedWeapons,function(v1,k1){
                            angular.forEach(v1.RangedWeapon.StatsTested,function(v2,k2){
                                v2.TestedStat.TestedStatMultiplier+=value.Perk.TestAddition;
                                v2.TestedStat.TestedStatMultiplier=Math.round(v2.TestedStat.TestedStatMultiplier*10)/10;
                            });
                        });
                        };
                    });

                
             

        }; 



        //Tests
        $scope.RollDice = function (){
            return Math.ceil(Math.random()*10)+Math.ceil(Math.random()*10);
        };
        $scope.TestSkill = function (passedSkillName,passedSkill){
            $scope.testResultTable[passedSkillName]= $scope.RollDice();
            $scope.testSuccesTable[passedSkillName]=passedSkill.TestValue-$scope.testResultTable[passedSkillName]+$scope.testImpedimentTable[passedSkillName];
            //console.log(passedSkillName+': '+$scope.testSuccesTable[passedSkillName]+' | '+passedSkill.TestValue+' | '+$scope.testResultTable[passedSkillName])
        };
        $scope.ComputeDamage = function (DamageMultiplier,SucceseAmount){
            if(DamageMultiplier*SucceseAmount>=0){
                return DamageMultiplier*SucceseAmount;
            }else
            return 0;
           console.log(Table);
        };  
        $scope.CastSpell =  function (passedSkillName,passedSkill,Spell,index,MagicSchoolName){
            // if(AnimaCost<=$scope.Magic.CurrentAnima){
                var SpellID=passedSkillName+index+MagicSchoolName;
                $scope.RollDice(passedSkillName,passedSkill,SpellID);
                $scope.testResultTable[SpellID]=$scope.RollDice();
                $scope.testSuccesTable[SpellID]=passedSkill.TestValue-$scope.testResultTable[SpellID]+$scope.testImpedimentTable[SpellID] - Spell.SpellDifficulty;
                if($scope.testSuccesTable[SpellID]<=0){
                    $scope.Vitality.VitalityCurrentPoints-=Spell.SpellDifficulty;
                    $scope.healthChange();
                    if($scope.Vitality.VitalityCurrentPoints<0){

                        $scope.Vitality.VitalityCurrentPoints=0;

                    };
                };
                $scope.DamageTable[SpellID]=$scope.ComputeDamage(Spell.DamageMultiplier, $scope.testSuccesTable[SpellID]);
;            //     if($scope.inCombat)
            //         $scope.Magic.CurrentAnima = $scope.Magic.CurrentAnima - AnimaCost;
            // };
            // $scope.AnimaChange();
        };
        // $scope.AnimaReplenish= function(){
        //     if($scope.Magic.CurrentAnima<=$scope.Magic.MaxAnima-$scope.Magic.AnimaRegeneration){
        //     $scope.Magic.CurrentAnima += $scope.Magic.AnimaRegeneration;
        // }else{
        //     $scope.Magic.CurrentAnima = $scope.Magic.MaxAnima;
        //     };
        // };
        // $scope.AnimaReplenishFull= function(){
        //     $scope.Magic.CurrentAnima = $scope.Magic.MaxAnima;
        // };
        // $scope.CountAnimaRegeneration= function(){
        //     $scope.Magic.AnimaRegeneration=Math.floor($scope.Magic.MaxAnima/5);
        // };
        $scope.NewTurn = function(){
            // $scope.AnimaReplenish();
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
            $scope.UpdateMeleeWeapons();
            $scope.UpdateRangedWeapons();
            
            
            

        };

        $scope.DerivativeStatChange = function(passedMainStatistic,passedDerivativeStatistic){
            
            
            
            $scope.CountExp(passedDerivativeStatistic.derivativeStatisticName,passedDerivativeStatistic.derivativeStatisticValue,40);             
            $scope.countExpToSpend();
            $scope.countMaxStatToBuy();
            
            $scope.SecondaryStatEvaluate(passedMainStatistic.secondaryStatName,passedMainStatistic.mainStatisticValue,passedMainStatistic.mainStatisticName);
            $scope.sumDerivativeStats(passedMainStatistic);
            $scope.countBonus(passedMainStatistic.mainStatisticName);
            $scope.countCurrentStatSum('Derivative',passedMainStatistic,passedDerivativeStatistic);
            $scope.countCurrentStatSum('Main',passedMainStatistic,0);
            $scope.UpdateSkills();
            $scope.UpdateMeleeWeapons();
            $scope.UpdateRangedWeapons();



        };
        // $scope.AnimaChange = function (){
        //     $scope.AnimaPercentageCount();
        // }
        // $scope.AnimaMaxValueChange = function (){
        //     $scope.CountExp('MaxAnima',$scope.Magic.MaxAnima,1);
        //     $scope.countExpToSpend();  
        //     $scope.countMaxStatToBuy();
        //     $scope.CountAnimaRegeneration();
        //     $scope.CountCurrentAnima();
        // };

        $scope.CountExpAfterPerkAdd=function(){
            $scope.TotalUsedExperience+=$scope.PerkCost;
            $scope.countExpToSpend();
        };
        $scope.CountExpAfterPerkRemoval=function(){
            $scope.TotalUsedExperience-=$scope.PerkCost;
            $scope.countExpToSpend();
        };

        $scope.CountExpAfterSkillAdd=function(){
            $scope.TotalUsedExperience+=$scope.skillCost;
            $scope.countExpToSpend();
        };
        $scope.CountExpAfterSkillRemoval=function(){
            $scope.TotalUsedExperience-=$scope.skillCost;
            $scope.countExpToSpend();
        };
        //when starts at 0
        $scope.CountArithmeticProgression = function (startingValue,numberOfElements,AddedValue){
            var sum=0;

            sum = ((startingValue+startingValue+(numberOfElements-1)*AddedValue)/2)*numberOfElements;
            //console.log('startingValue: '+startingValue+' numberOfElements: '+numberOfElements+' AddedValue: '+AddedValue+' sum: '+sum);
            return sum;
        };
        $scope.CountSkillsExp= function(){
            $scope.TotalUsedExperience+=$scope.CharacterSkills.length*$scope.skillCost;
        };
        $scope.CountPerksExp= function(){
            $scope.TotalUsedExperience+=$scope.Perks.length*$scope.PerkCost;
            
        };
        $scope.CountMagicExp= function(){
            $scope.TotalUsedExperience+=$scope.CountArithmeticProgression(0,$scope.Magic.MaxAnima-9,1);
            angular.forEach($scope.Magic.MagicSchools,function(value,key){
                $scope.TotalUsedExperience+=$scope.CountArithmeticProgression(0,value.MagicSchool.Proficiency.ProficiencyLevel,200);
            });
        };
        $scope.GlobalModifierChange = function(){
            angular.forEach($scope.Stats,function(value,key){
                    $scope.countCurrentStatSum('Main',value.mainStatistic,0);
                angular.forEach(value.mainStatistic.derivativeStats,function(v1,k1){
                    $scope.countCurrentStatSum('Derivative',value.mainStatistic,v1.derivativeStatistic);
                });
                $scope.UpdateSkills();
                $scope.UpdateMeleeWeapons();
                $scope.UpdateRangedWeapons();
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
             $scope.UpdateMeleeWeapons();
             $scope.UpdateRangedWeapons();
        };

        $scope.derivativeModifierChange = function(passedMainStatistic,passedDerivativeStatistic){
             
                $scope.countCurrentStatSum('Derivative',passedMainStatistic,passedDerivativeStatistic); 
                $scope.UpdateSkills();  
                $scope.UpdateMeleeWeapons();
                $scope.UpdateRangedWeapons();         
        };

        // Class definition / constructor
        $scope.MakeNewPerk = function() {
           var NewPerk={Perk : {
                            PerkName : $scope.PerkToAdd.Perk.PerkName,
                            AssociatedSkill : $scope.PerkToAdd.Perk.AssociatedSkill,
                            TestAddition : Math.round($scope.PerkToAdd.Perk.TestAddition*10)/10,
                            Description : $scope.PerkToAdd.Perk.Description,
                            PerkType : $scope.PerkToAdd.PerkType
                        }
                    };

            return NewPerk;
            
            };
        $scope.MakeNewSkill = function() {
           var NewSkill={
                      Skill: {
                        SkillName: $scope.SkillToAdd.Skill.SkillName,
                        PerksAssociatedWithSkill: 0,
                        TestValue: 0,
                        StatsTested: $scope.SkillToAdd.Skill.StatsTested
                      }
                    };
            return NewSkill;
            
            };
        $scope.MakeNewSpell = function() {
           var NewSpell={Spell:null};
            // NewSpell.Spell=null;
            NewSpell.Spell=angular.copy($scope.SpellToAdd.Spell);
            // $scope.CountSpellAnimaCost(NewSpell.Spell,$scope.SpellToAdd.School);
            $scope.CountSpellDifficulty(NewSpell.Spell,$scope.SpellToAdd.School);
            $scope.ComputeSpellDamage(NewSpell.Spell,$scope.SpellToAdd.School);

            return NewSpell;
            
            };
        $scope.MakeNewMagicSchool = function() {
           var NewMagicSchool=angular.copy($scope.MagicSchoolToAdd);
            return NewMagicSchool;
            
            };

            $scope.RemapPerks = function(){
                $scope.PerksTable = new Map();
                angular.forEach($scope.Perks,function(value,key){
                $scope.PerksTable[value.Perk.PerkName]=value.Perk;
            });
            };
            $scope.RemapSkills = function(){
                $scope.SkillsTable = new Map();
                angular.forEach($scope.CharacterSkills,function(value,key){
                $scope.SkillsTable[value.Skill.SkillName]=value.Skill;
            });
            };
        

        $scope.PerkModalShow = function (){
            $scope.PerkModalVis=true;
            
        };

        $scope.AddPerk=function (){
            if($scope.PerkToAdd.Perk.AssociatedSkill!==""&&$scope.toSpendCharacterExperience>=$scope.PerkCost){
                $scope.Perks.push($scope.MakeNewPerk());

                $scope.RemapPerks();
                $scope.CountPerks();
                $scope.UpdateSkills();
                $scope.UpdateMeleeWeapons();
                $scope.UpdateRangedWeapons();
                $scope.CountExpAfterPerkAdd();
                $scope.PerkModalVis=false;
                
            }else{
                alert('Choose associated Skill');
            };

        }
        $scope.removePerk = function(key) { 
          

          function itemCompare(element){
            
            return element == key;

          };
          var index = $scope.Perks.findIndex(itemCompare);
          
          
          $scope.Perks.splice(index,1);
          $scope.RemapPerks();
          $scope.CountPerks();
          $scope.UpdateSkills();
          $scope.UpdateMeleeWeapons();
          $scope.UpdateRangedWeapons();
          $scope.CountExpAfterPerkRemoval();
          
        };
        $scope.AddSkill=function (){
            if(true){
                $scope.CharacterSkills.push($scope.MakeNewSkill());
                $scope.CountPerks();
                $scope.RemapSkills();
                $scope.UpdateSkills();
                $scope.SkillModalVis=false;
                $scope.CountExpAfterSkillAdd();
                
            }else{
                alert('Coś nie pykło');
            };

        };
        $scope.RemoveSkill = function(key) { 
          

          function itemCompare(element){

            return element == key;

          };
          var index = $scope.CharacterSkills.findIndex(itemCompare);
          
          $scope.CharacterSkills.splice(index,1);
          $scope.RemapSkills();
          $scope.CountPerks();
          $scope.UpdateSkills();
          $scope.UpdateMeleeWeapons();
          $scope.UpdateRangedWeapons();
          $scope.CountExpAfterSkillRemoval();
          
        };

        $scope.AddMagicSchool=function (){
                
                $scope.Magic.MagicSchools.push($scope.MakeNewMagicSchool());
                $scope.MagicSchoolModalVis=false
                
        };
        $scope.RemoveMagicSchool = function(key) { 
          

          function itemCompare(element){

            
            return element == key;

          };
          var index = $scope.Magic.MagicSchools.findIndex(itemCompare);
          
          
          $scope.Magic.MagicSchools.splice(index,1);

        };
        $scope.openSpellModal = function (passedSchool){
            $scope.SpellModalVis=true;
            $scope.SetSpellSchool(passedSchool);
            
        }
        $scope.SetSpellSchool = function (passedSchool) {
            $scope.SpellToAdd.School = passedSchool;
            
        };
        $scope.AddSpell=function (){
            $scope.SpellToAdd.School.Spells.push($scope.MakeNewSpell());

            $scope.SpellModalVis=false
                
        };
        $scope.RemoveSpell = function(Spell,School) { 
          

          function itemCompare(element){

            return element == Spell;

          };
          var index = School.Spells.findIndex(itemCompare);
          
          
          School.Spells.splice(index,1);

        };


        $scope.hasRequiredSpellType = function(roles) {
            var hasRequiredSpellType = false;
                for(var i = 0; i < roles.length; i++) {
                    if (roles[i].name == 'Admin') {
                        hasRequiredSpellType = true;
                    break;
                }
            }

        return hasRequiredSpellType;
}

        $scope.$watch('VitalityModifierTable',function(){
            angular.forEach($scope.Stats,function(value,key){
                    $scope.countCurrentStatSum('Main',value.mainStatistic,0);
                angular.forEach(value.mainStatistic.derivativeStats,function(v1,k1){
                    $scope.countCurrentStatSum('Derivative',value.mainStatistic,v1.derivativeStatistic);
                });
                $scope.UpdateSkills();
                $scope.UpdateMeleeWeapons();
                $scope.UpdateRangedWeapons();
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
                            Description:'Random Description',
                            PerkType:''
                        }
                };
                $scope.SkillToAdd=
                    {
                      Skill: {
                        SkillName:'',
                        PerksAssociatedWithSkill: 0,
                        TestValue: 0,
                        StatsTested: [
                          {
                            TestedStat: {
                              TestedStatName: '',
                              BaseTestedStatMultiplier: 0.1,
                              TestedStatMultiplier: 0.1
                            }
                          },
                          {
                            TestedStat: {
                              TestedStatName: '',
                              BaseTestedStatMultiplier: 0.1,
                              TestedStatMultiplier: 0.1
                            }
                          }
                        ]
                      }
                    };
                $scope.MagicSchoolToAdd= {
                        MagicSchool: {
                          MagicSchoolName: '',
                          Power: 1,
                          PowerBonus: 0,
                          Range: 4,
                          AoERadius: 1,
                          DifficultyReduction: 0,
                          SpellPenetration: 0,
                          SingleTargetDmgIncrease: 0,
                          MultipleTargetDmgIncrease: 0,
                          SingleTargetHealingIncrease: 0,
                          MultipleTargetHealingIncrease: 0,
                          RadiusIncrease: 0,
                          RangeIncrease: 0,
                          Description:'',
                          Spells: [],
                          Proficiency: {
                            ProficiencyLevel: 1,
                            ProficiencyPerksList: []
                          }
                        }
                    };

                $scope.AddedSkillMultiplierSum=0;
                $scope.AddedSkillMiltiplierLimit=0;
                $scope.ExtendTestedStats = function(){
                    if($scope.AddedSkillMultiplierLimit>0){
                    $scope.SkillToAdd.Skill.StatsTested.push({
                            TestedStat: {
                              TestedStatName: '',
                              BaseTestedStatMultiplier: 0.1,
                              TestedStatMultiplier: 0.1
                            }});
                        $scope.AddedSkillMultiplierChange(0.1);
                    };
                    // $scope.AddedSkillMultiplierChange(0);
                };
                $scope.CutTestedStats = function (){
                    var i = $scope.SkillToAdd.Skill.StatsTested -1;
                    
                    $scope.SkillToAdd.Skill.StatsTested.splice(i,1);
                    $scope.AddedSkillMultiplierChange(0.1);
                    // $scope.AddedSkillMultiplierChange(0);
                };
                $scope.AddedSkillMultiplierChange = function (passedCurrentValue){
                    $scope.AddedSkillMultiplierSum=0;
                    if(passedCurrentValue==undefined){
                        passedCurrentValue=0;
                    };
                    angular.forEach($scope.SkillToAdd.Skill.StatsTested,function(value,key){
                        
                        $scope.AddedSkillMultiplierSum+=parseFloat(value.TestedStat.BaseTestedStatMultiplier);
                        
                    });
                    $scope.AddedSkillMultiplierSum=parseFloat($scope.AddedSkillMultiplierSum);

                    passedCurrentValue=parseFloat(passedCurrentValue);
                    
                    $scope.AddedSkillMultiplierLimit=Math.round((1-$scope.AddedSkillMultiplierSum)*10)/10;
                    

                };
                $scope.MeleeWeaponToAdd={Perk:{
                            PerkName:'',
                            AssociatedSkill:'',
                            TestAddition:0.1,
                            Description:'Random Description',
                            PerkType:''
                        }
                };
                $scope.RangedWeaponToAdd={Perk:{
                            PerkName:'',
                            AssociatedSkill:'',
                            TestAddition:0.1,
                            Description:'Random Description',
                            PerkType:''
                        }
                };
                $scope.SpellToAdd={
                      School: null,
                      Spell: {
                        Type: '',
                        TargetType: '',
                        SpellName: '',
                        Impediment: 0,
                        Penetration: 0,
                        // BaseCost: 0,
                        // AnimaCost: 0,
                        BaseSpellDifficulty:0,
                        SpellDifficulty:0,
                        DamagePower: 1,
                        BaseDamageMultiplier: 0,
                        DamageMultiplier: 0,
                        Description: ''
                        }
                };
                $scope.MagicSchoolToAdd= {
                        MagicSchool: {
                          MagicSchoolName: '',
                          Power: 1,
                          Range: 4,
                          AoERadius: 1,
                          CostReduction: 0,
                          SpellPenetration: 0,
                          DamageIncrease: 0,
                          HealingIncrease: 0,
                          RadiusIncrease: 0,
                          RangeIncrease: 0,
                          Description:'',
                          Spells: [],
                          Proficiency: {
                            ProficiencyLevel: 1,
                            ProficiencyPerksList: []
                          }
                        }
                    };

            //Spell methods
            // $scope.CountBaseSpellCost = function(Spell){
            //     Spell.BaseCost=Spell.Type.BaseCost+Spell.TargetType.BaseCost;
            // };
            $scope.SetSpell=function(Spell){
                 $scope.CountBaseSpellDifficulty(Spell.Spell);
                 $scope.SetSpellPower(Spell.Spell);
                 // $scope.SetSpellDamageMultiplier(Spell);
            };
            $scope.SetSpellPower = function(Spell){
                Spell.DamagePower = Spell.Type.DamagePower;
            };


            $scope.ComputeSpellDamage = function (Spell,MagicSchool){
                Spell.DamageMultiplier = Math.pow(MagicSchool.Power + Spell.BaseDamageMultiplier + MagicSchool.DamageIncrease,Spell.DamagePower);
                
            };
            $scope.ComputeSpellHealing = function (Spell,MagicSchool){
                Spell.DamageMultiplier = Math.pow(MagicSchool.Power + Spell.BaseDamageMultiplier + MagicSchool.HealingIncrease,Spell.DamagePower);
            };


            $scope.CountBaseSpellDifficulty = function(Spell){
                Spell.BaseSpellDifficulty=Spell.Type.BaseSpellDifficulty+Spell.TargetType.BaseSpellDifficulty;

            };

            $scope.SetSpellDamageMultiplier = function(Spell){
                Spell.Spell.BaseDamageMultiplier=Math.pow(Spell.School.Power+Spell.School.DamageIncrease,Spell.Spell.DamagePower);                
            };

            $scope.CountSpellAnimaCost = function(Spell,MagicSchool){
                Spell.AnimaCost=Spell.BaseCost+MagicSchool.Power-MagicSchool.CostReduction;
            };


            $scope.CountSpellDifficulty = function(Spell,MagicSchool){
                Spell.SpellDifficulty=Spell.BaseSpellDifficulty+MagicSchool.Proficiency.ProficiencyLevel-MagicSchool.DifficultyReduction;        
                   
                if(Spell.SpellDifficulty<0){
                    Spell.SpellDifficulty=0;
                };
            };
            $scope.ComputeSpellMultiplier = function (Spell,MagicSchool){
                if($scope.DamageTypes.indexOf(Spell.Type.SpellTypeName)!==-1){
                    $scope.ComputeSpellDamage(Spell,MagicSchool);

                }else{
                    if($scope.HealingTypes.indexOf(Spell.Type.SpellTypeName)!==-1)
                        $scope.ComputeSpellHealing(Spell,MagicSchool);
                };
            };
            $scope.DamageTypes=["Missle","Killer Whale Missle","Area of Effect Damage","Offensive Spell"];
            $scope.HealingTypes=["Healing Spell","Area of Effect Heal"];

            $scope.ComputeSchoolPower = function(MagicSchool){
                MagicSchool.Power = MagicSchool.Proficiency.ProficiencyLevel + MagicSchool.PowerBonus;
            };
            $scope.CountSpellCostWithinSchool = function(MagicSchool){
                 angular.forEach(MagicSchool.Spells,function(value,key){
                    $scope.CountSpellAnimaCost(value.Spell,MagicSchool);
                 });
            };
            $scope.CountSpellCostOfAllSPells =function(){
                angular.forEach($scope.Magic.MagicSchools,function(value,key){
                    $scope.CountSpellCostWithinSchool(value.MagicSchool);
                });
            };
            $scope.ComputeRange = function (MagicSchool){
                MagicSchool.Range = Math.pow((MagicSchool.Power+MagicSchool.RangeIncrease),3);
            };
            $scope.ComputeAoERadius = function (MagicSchool){
                MagicSchool.AoERadius = Math.pow((MagicSchool.Power+MagicSchool.RadiusIncrease),2);
            };
            $scope.ProficiencyLevelChange = function(MagicSchool){
                $scope.ComputeSchoolPower(MagicSchool);
                $scope.ComputeRange(MagicSchool);
                $scope.ComputeAoERadius(MagicSchool);
                 angular.forEach(MagicSchool.Spells,function(value,key){
                   $scope.CountSpellDifficulty(value.Spell,MagicSchool);
                   $scope.ComputeSpellMultiplier(value.Spell,MagicSchool);
                   
                });
                
            };
            $scope.SchoolPowerChange = function (MagicSchool){
                $scope.ComputeSchoolPower(MagicSchool);
                $scope.ComputeRange(MagicSchool);
                $scope.ComputeAoERadius(MagicSchool);
                angular.forEach(MagicSchool.Spells,function(value,key){
                   $scope.CountSpellDifficulty(value.Spell,MagicSchool);
                   $scope.ComputeSpellMultiplier(value.Spell,MagicSchool);
                   
                });
            };
            $scope.DifficultyReductionChange= function (MagicSchool){
                angular.forEach(MagicSchool.Spells,function(value,key){
                  $scope.CountSpellDifficulty(value.Spell,MagicSchool);
                   
                });
            };
            $scope.IncreaseChange = function (MagicSchool){
                angular.forEach(MagicSchool.Spells,function(value,key){
                 $scope.ComputeSpellMultiplier(value.Spell,MagicSchool);
                });
            };
            
            

            angular.forEach($scope.Perks,function(value,key){
                $scope.PerksTable[value.Perk.PerkName]=value.Perk;
            });
            angular.forEach($scope.Equipment.Armor,function(value,key){
                $scope.ArmorTable[value.ArmorPiece.ArmorPieceName]=value.ArmorPiece;
            });
            angular.forEach($scope.Equipment.MeleeWeapons,function(value,key){
                $scope.MeleeWeaponsTable[value.MeleeWeapon.WeaponName]=value.MeleeWeapon;
                $scope.testImpedimentTable[value.MeleeWeapon.WeaponName]=0;
            });
            angular.forEach($scope.Equipment.RangedWeapons,function(value,key){
                $scope.RangedWeaponsTable[value.RangedWeapon.WeaponName]=value.RangedWeapon;
                $scope.testImpedimentTable[value.RangedWeapon.WeaponName]=0;
            });
            
            angular.forEach($scope.CharacterSkills,function(value,key){
                $scope.SkillTable[value.Skill.SkillName]=value.Skill;
                $scope.testImpedimentTable[value.Skill.SkillName]=0;

               

            });
            
            $scope.TotalUsedExperience=0;
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
            $scope.UpdateMeleeWeapons();
            $scope.UpdateRangedWeapons();
            $scope.healthMultiply();
            $scope.AddedSkillMultiplierChange();
            $scope.CountSpellCostOfAllSPells();
                };

        $http.get('/JSON/myNewCharacterJSON.json').success(function(data) {
            $scope.ReloadCharacter(data,$scope);

             });
        $scope.fileChanged = function() {

          // define reader
          var reader = new FileReader();

          // A handler for the load event (just defining it, not executing it right now)
          reader.onload = function(e) {
              $scope.$apply(function() {
                  $scope.File = reader.result;
                  
              });
          };

          // get <input> element and the selected file 
          var FileInput = document.getElementById('fileInput');    
          var File = FileInput.files[0];

          // use reader to read the selected file
          // when read operation is successfully finished the load event is triggered
          // and handled by our reader.onload function
          
          reader.readAsText(File);
          
        };
        $scope.loadCharacter=function(){          
                      
            $scope.ReloadCharacter($scope.File,$scope);
            alert('Load Complete');
        };

}]);
